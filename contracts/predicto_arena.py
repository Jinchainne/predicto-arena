# v0.3.0
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *


class Contract(gl.Contract):
    owner: Address
    market_count: u256

    market_creator: TreeMap[u256, Address]
    market_title: TreeMap[u256, str]
    market_category: TreeMap[u256, str]
    market_rules: TreeMap[u256, str]
    market_source_url: TreeMap[u256, str]
    market_status: TreeMap[u256, str]  # OPEN, RESOLVED, CANCELED
    market_outcome_count: TreeMap[u256, u256]
    market_resolved_outcome: TreeMap[u256, u256]
    market_resolution_note: TreeMap[u256, str]

    # Key format: market_id * 100000 + outcome_index
    outcome_name: TreeMap[u256, str]
    outcome_pool_cents: TreeMap[u256, u256]
    user_position_cents: TreeMap[str, u256]

    def __init__(self):
        self.owner = gl.message.sender_address
        self.market_count = u256(0)

    def _key(self, market_id: u256, outcome_index: u256) -> u256:
        return market_id * u256(100000) + outcome_index

    def _user_key(self, market_id: u256, outcome_index: u256, user: Address) -> str:
        return str(market_id) + ":" + str(outcome_index) + ":" + str(user)

    def _is_valid_url(self, url: str) -> bool:
        return url.startswith("https://") or url.startswith("http://")

    def _clip(self, text: str, max_len: int) -> str:
        if len(text) <= max_len:
            return text
        return text[:max_len]

    @gl.public.write
    def create_market(self, title: str, category: str, rules: str, source_url: str, outcomes_csv: str) -> u256:
        if len(title) < 8:
            raise UserError("Market title is too short")
        if len(category) < 2:
            raise UserError("Category is too short")
        if len(rules) < 30:
            raise UserError("Resolution rules must be detailed")
        if not self._is_valid_url(source_url):
            raise UserError("Source URL must be valid")

        self.market_count += u256(1)
        market_id = self.market_count
        self.market_creator[market_id] = gl.message.sender_address
        self.market_title[market_id] = title
        self.market_category[market_id] = category
        self.market_rules[market_id] = rules
        self.market_source_url[market_id] = source_url
        self.market_status[market_id] = "OPEN"
        self.market_resolved_outcome[market_id] = u256(0)
        self.market_resolution_note[market_id] = "Market created. Trading is open."

        count = u256(0)
        current = ""
        i = 0
        while i < len(outcomes_csv):
            char = outcomes_csv[i]
            if char == ",":
                if len(current.strip()) >= 1:
                    count += u256(1)
                    self.outcome_name[self._key(market_id, count)] = current.strip()
                    self.outcome_pool_cents[self._key(market_id, count)] = u256(100)
                current = ""
            else:
                current += char
            i += 1
        if len(current.strip()) >= 1:
            count += u256(1)
            self.outcome_name[self._key(market_id, count)] = current.strip()
            self.outcome_pool_cents[self._key(market_id, count)] = u256(100)

        if count < u256(2):
            raise UserError("Market needs at least two outcomes")
        if count > u256(8):
            raise UserError("Market supports up to eight outcomes")

        self.market_outcome_count[market_id] = count
        return market_id

    @gl.public.write
    def buy_position(self, market_id: int, outcome_index: int, amount_cents: int) -> None:
        mid = u256(market_id)
        oid = u256(outcome_index)
        if mid == u256(0) or mid > self.market_count:
            raise UserError("Invalid market id")
        if self.market_status[mid] != "OPEN":
            raise UserError("Market is not open")
        if oid == u256(0) or oid > self.market_outcome_count[mid]:
            raise UserError("Invalid outcome")
        if amount_cents <= 0:
            raise UserError("Amount must be positive")

        key = self._key(mid, oid)
        self.outcome_pool_cents[key] += u256(amount_cents)
        user_key = self._user_key(mid, oid, gl.message.sender_address)
        self.user_position_cents[user_key] += u256(amount_cents)

    @gl.public.write
    def resolve_market(self, market_id: int) -> u256:
        mid = u256(market_id)
        if mid == u256(0) or mid > self.market_count:
            raise UserError("Invalid market id")
        if gl.message.sender_address != self.market_creator[mid]:
            raise UserError("Only market creator can resolve")
        if self.market_status[mid] != "OPEN":
            raise UserError("Market is not open")

        title = self.market_title[mid]
        rules = self.market_rules[mid]
        source_url = self.market_source_url[mid]
        count = self.market_outcome_count[mid]
        outcome_text = ""
        i = u256(1)
        while i <= count:
            outcome_text += str(i) + ". " + self.outcome_name[self._key(mid, i)] + "\n"
            i += u256(1)

        def leader_fn():
            source_text = ""
            try:
                source_text = gl.nondet.web.render(source_url, mode="text")
            except Exception:
                source_text = "[SOURCE_FETCH_FAILED]"

            prompt = f"""
Resolve this prediction market using the source text and rules.
Return strict JSON only.

Market: {title}
Rules: {rules}
Outcomes:
{outcome_text}
Source URL: {source_url}
Source text excerpt: {self._clip(source_text, 10000)}

Return:
{{
  "winning_outcome": 1,
  "confidence": 0-100,
  "note": "short source-grounded resolution explanation"
}}
"""
            return gl.nondet.exec_prompt(prompt, response_format="json")

        def validator_fn(leader_result) -> bool:
            if not isinstance(leader_result, gl.vm.Return):
                return False
            data = leader_result.calldata
            try:
                winning = u256(int(data["winning_outcome"]))
                confidence = int(data["confidence"])
                if winning == u256(0) or winning > count:
                    return False
                if confidence < 50 or confidence > 100:
                    return False
                if len(str(data["note"])) < 10:
                    return False
                validator_data = leader_fn()
                validator_winning = u256(int(validator_data["winning_outcome"]))
                return winning == validator_winning
            except Exception:
                return False

        result = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
        winning_outcome = u256(int(result["winning_outcome"]))
        self.market_resolved_outcome[mid] = winning_outcome
        self.market_status[mid] = "RESOLVED"
        self.market_resolution_note[mid] = self._clip(str(result["note"]), 900)
        return winning_outcome

    @gl.public.view
    def get_total_markets(self) -> u256:
        return self.market_count

    @gl.public.view
    def get_market(self, market_id: int) -> dict:
        mid = u256(market_id)
        if mid == u256(0) or mid > self.market_count:
            raise UserError("Invalid market id")
        return {
            "id": str(mid),
            "creator": str(self.market_creator[mid]),
            "title": self.market_title[mid],
            "category": self.market_category[mid],
            "rules": self.market_rules[mid],
            "source_url": self.market_source_url[mid],
            "status": self.market_status[mid],
            "outcome_count": str(self.market_outcome_count[mid]),
            "resolved_outcome": str(self.market_resolved_outcome[mid]),
            "resolution_note": self.market_resolution_note[mid],
        }

    @gl.public.view
    def get_outcome(self, market_id: int, outcome_index: int) -> dict:
        mid = u256(market_id)
        oid = u256(outcome_index)
        if mid == u256(0) or mid > self.market_count:
            raise UserError("Invalid market id")
        if oid == u256(0) or oid > self.market_outcome_count[mid]:
            raise UserError("Invalid outcome")
        key = self._key(mid, oid)
        return {
            "market_id": str(mid),
            "outcome_index": str(oid),
            "name": self.outcome_name[key],
            "pool_cents": str(self.outcome_pool_cents[key]),
        }

    @gl.public.view
    def get_position(self, market_id: int, outcome_index: int, user: Address) -> u256:
        return self.user_position_cents[self._user_key(u256(market_id), u256(outcome_index), user)]
