# v0.5.0
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *


class Contract(gl.Contract):
    owner: Address
    market_count: u256

    market_creator: TreeMap[u256, Address]
    market_external_id: TreeMap[u256, str]
    external_market_to_id: TreeMap[str, u256]
    market_title: TreeMap[u256, str]
    market_category: TreeMap[u256, str]
    market_rules: TreeMap[u256, str]
    market_source_url: TreeMap[u256, str]
    market_status: TreeMap[u256, str]  # OPEN, PAUSED, RESOLVING, RESOLVED, CANCELED
    market_outcome_count: TreeMap[u256, u256]
    market_resolved_outcome: TreeMap[u256, u256]
    market_resolution_note: TreeMap[u256, str]
    market_fee_bps: TreeMap[u256, u256]
    market_volume_cents: TreeMap[u256, u256]
    market_liquidity_cents: TreeMap[u256, u256]
    market_fee_cents: TreeMap[u256, u256]
    market_evidence_count: TreeMap[u256, u256]
    market_dispute_count: TreeMap[u256, u256]

    # Key format: market_id * 100000 + outcome_index
    outcome_name: TreeMap[u256, str]
    outcome_pool_cents: TreeMap[u256, u256]
    user_position_cents: TreeMap[str, u256]
    user_liquidity_cents: TreeMap[str, u256]
    user_claimed_cents: TreeMap[str, u256]
    evidence_url: TreeMap[u256, str]
    evidence_note: TreeMap[u256, str]
    evidence_submitter: TreeMap[u256, Address]
    dispute_note: TreeMap[u256, str]
    dispute_submitter: TreeMap[u256, Address]
    dispute_status: TreeMap[u256, str]

    def __init__(self):
        self.owner = gl.message.sender_address
        self.market_count = u256(0)

    def _key(self, market_id: u256, outcome_index: u256) -> u256:
        return market_id * u256(100000) + outcome_index

    def _user_key(self, market_id: u256, outcome_index: u256, user: Address) -> str:
        return str(market_id) + ":" + str(outcome_index) + ":" + str(user)

    def _liquidity_key(self, market_id: u256, user: Address) -> str:
        return str(market_id) + ":LP:" + str(user)

    def _evidence_key(self, market_id: u256, evidence_index: u256) -> u256:
        return market_id * u256(100000) + evidence_index

    def _dispute_key(self, market_id: u256, dispute_index: u256) -> u256:
        return market_id * u256(100000) + dispute_index

    def _external_key(self, external_id: str) -> str:
        return self._clip(external_id.strip(), 80)

    def _is_valid_url(self, url: str) -> bool:
        return url.startswith("https://") or url.startswith("http://")

    def _clip(self, text: str, max_len: int) -> str:
        if len(text) <= max_len:
            return text
        return text[:max_len]

    def _assert_market_open(self, market_id: u256):
        if market_id == u256(0) or market_id > self.market_count:
            raise UserError("Invalid market id")
        if self.market_status[market_id] != "OPEN":
            raise UserError("Market is not open")

    def _assert_outcome(self, market_id: u256, outcome_index: u256):
        if outcome_index == u256(0) or outcome_index > self.market_outcome_count[market_id]:
            raise UserError("Invalid outcome")

    def _total_pool(self, market_id: u256) -> u256:
        total = u256(0)
        i = u256(1)
        while i <= self.market_outcome_count[market_id]:
            total += self.outcome_pool_cents[self._key(market_id, i)]
            i += u256(1)
        return total

    def _price_cents(self, market_id: u256, outcome_index: u256) -> u256:
        total = self._total_pool(market_id)
        if total == u256(0):
            return u256(50)
        price = (self.outcome_pool_cents[self._key(market_id, outcome_index)] * u256(100)) // total
        if price < u256(1):
            return u256(1)
        if price > u256(99):
            return u256(99)
        return price

    def _create_market(
        self,
        external_id: str,
        title: str,
        category: str,
        rules: str,
        source_url: str,
        outcomes_csv: str,
    ) -> u256:
        ext = self._external_key(external_id)
        if len(ext) < 1:
            raise UserError("External id is required")
        if self.external_market_to_id[ext] != u256(0):
            return self.external_market_to_id[ext]
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
        self.market_external_id[market_id] = ext
        self.external_market_to_id[ext] = market_id
        self.market_title[market_id] = self._clip(title, 180)
        self.market_category[market_id] = self._clip(category, 40)
        self.market_rules[market_id] = self._clip(rules, 1200)
        self.market_source_url[market_id] = self._clip(source_url, 500)
        self.market_status[market_id] = "OPEN"
        self.market_resolved_outcome[market_id] = u256(0)
        self.market_resolution_note[market_id] = "Market created. AMM trading is open."
        self.market_fee_bps[market_id] = u256(35)
        self.market_evidence_count[market_id] = u256(1)
        first_evidence_key = self._evidence_key(market_id, u256(1))
        self.evidence_url[first_evidence_key] = self._clip(source_url, 500)
        self.evidence_note[first_evidence_key] = "Primary resolution source provided at market creation."
        self.evidence_submitter[first_evidence_key] = gl.message.sender_address

        count = u256(0)
        current = ""
        i = 0
        while i < len(outcomes_csv):
            char = outcomes_csv[i]
            if char == ",":
                if len(current.strip()) >= 1:
                    count += u256(1)
                    self.outcome_name[self._key(market_id, count)] = self._clip(current.strip(), 60)
                    self.outcome_pool_cents[self._key(market_id, count)] = u256(10000)
                current = ""
            else:
                current += char
            i += 1
        if len(current.strip()) >= 1:
            count += u256(1)
            self.outcome_name[self._key(market_id, count)] = self._clip(current.strip(), 60)
            self.outcome_pool_cents[self._key(market_id, count)] = u256(10000)

        if count < u256(2):
            raise UserError("Market needs at least two outcomes")
        if count > u256(8):
            raise UserError("Market supports up to eight outcomes")

        self.market_outcome_count[market_id] = count
        self.market_liquidity_cents[market_id] = count * u256(10000)
        return market_id

    def _buy_position(self, market_id: u256, outcome_index: u256, amount_cents: u256):
        self._assert_market_open(market_id)
        self._assert_outcome(market_id, outcome_index)
        if amount_cents == u256(0):
            raise UserError("Amount must be positive")

        fee = (amount_cents * self.market_fee_bps[market_id]) // u256(10000)
        net = amount_cents - fee
        key = self._key(market_id, outcome_index)
        self.outcome_pool_cents[key] += net
        self.market_fee_cents[market_id] += fee
        self.market_volume_cents[market_id] += amount_cents
        self.market_liquidity_cents[market_id] += net
        self.user_position_cents[self._user_key(market_id, outcome_index, gl.message.sender_address)] += net

    def _sell_position(self, market_id: u256, outcome_index: u256, amount_cents: u256):
        self._assert_market_open(market_id)
        self._assert_outcome(market_id, outcome_index)
        if amount_cents == u256(0):
            raise UserError("Amount must be positive")

        user_key = self._user_key(market_id, outcome_index, gl.message.sender_address)
        if self.user_position_cents[user_key] < amount_cents:
            raise UserError("Not enough position to sell")
        outcome_key = self._key(market_id, outcome_index)
        if self.outcome_pool_cents[outcome_key] <= amount_cents + u256(100):
            raise UserError("Pool depth too low")

        fee = (amount_cents * self.market_fee_bps[market_id]) // u256(10000)
        net = amount_cents - fee
        self.user_position_cents[user_key] -= amount_cents
        self.outcome_pool_cents[outcome_key] -= net
        self.market_fee_cents[market_id] += fee
        self.market_volume_cents[market_id] += amount_cents
        self.market_liquidity_cents[market_id] -= net

    @gl.public.write
    def create_market(self, title: str, category: str, rules: str, source_url: str, outcomes_csv: str) -> u256:
        return self._create_market(str(self.market_count + u256(1)), title, category, rules, source_url, outcomes_csv)

    @gl.public.write
    def create_market_with_external_id(
        self,
        external_id: str,
        title: str,
        category: str,
        rules: str,
        source_url: str,
        outcomes_csv: str,
    ) -> u256:
        return self._create_market(external_id, title, category, rules, source_url, outcomes_csv)

    @gl.public.write
    def ensure_market_and_buy(
        self,
        external_id: str,
        title: str,
        category: str,
        rules: str,
        source_url: str,
        outcomes_csv: str,
        outcome_index: int,
        amount_cents: int,
    ) -> None:
        mid = self._create_market(external_id, title, category, rules, source_url, outcomes_csv)
        self._buy_position(mid, u256(outcome_index), u256(amount_cents))

    @gl.public.write
    def ensure_market_and_add_liquidity(
        self,
        external_id: str,
        title: str,
        category: str,
        rules: str,
        source_url: str,
        outcomes_csv: str,
        amount_cents: int,
    ) -> None:
        mid = self._create_market(external_id, title, category, rules, source_url, outcomes_csv)
        self._add_liquidity(mid, u256(amount_cents))

    @gl.public.write
    def buy_position(self, market_id: int, outcome_index: int, amount_cents: int) -> None:
        self._buy_position(u256(market_id), u256(outcome_index), u256(amount_cents))

    @gl.public.write
    def buy_position_by_external_id(self, external_id: str, outcome_index: int, amount_cents: int) -> None:
        mid = self.external_market_to_id[self._external_key(external_id)]
        if mid == u256(0):
            raise UserError("External market is not created")
        self._buy_position(mid, u256(outcome_index), u256(amount_cents))

    @gl.public.write
    def sell_position(self, market_id: int, outcome_index: int, amount_cents: int) -> None:
        self._sell_position(u256(market_id), u256(outcome_index), u256(amount_cents))

    @gl.public.write
    def sell_position_by_external_id(self, external_id: str, outcome_index: int, amount_cents: int) -> None:
        mid = self.external_market_to_id[self._external_key(external_id)]
        if mid == u256(0):
            raise UserError("External market is not created")
        self._sell_position(mid, u256(outcome_index), u256(amount_cents))

    @gl.public.write
    def add_liquidity(self, market_id: int, amount_cents: int) -> None:
        self._add_liquidity(u256(market_id), u256(amount_cents))

    def _add_liquidity(self, market_id: u256, amount: u256):
        mid = market_id
        self._assert_market_open(mid)
        if amount == u256(0):
            raise UserError("Amount must be positive")
        count = self.market_outcome_count[mid]
        each = amount // count
        if each == u256(0):
            raise UserError("Amount too small")
        i = u256(1)
        while i <= count:
            self.outcome_pool_cents[self._key(mid, i)] += each
            i += u256(1)
        self.market_liquidity_cents[mid] += each * count
        self.user_liquidity_cents[self._liquidity_key(mid, gl.message.sender_address)] += each * count

    @gl.public.write
    def add_liquidity_by_external_id(self, external_id: str, amount_cents: int) -> None:
        mid = self.external_market_to_id[self._external_key(external_id)]
        if mid == u256(0):
            raise UserError("External market is not created")
        self._add_liquidity(mid, u256(amount_cents))

    @gl.public.write
    def add_evidence(self, market_id: int, url: str, note: str) -> u256:
        mid = u256(market_id)
        if mid == u256(0) or mid > self.market_count:
            raise UserError("Invalid market id")
        if self.market_status[mid] == "CANCELED":
            raise UserError("Market is canceled")
        if not self._is_valid_url(url):
            raise UserError("Evidence URL must be valid")
        if len(note) < 10:
            raise UserError("Evidence note is too short")

        self.market_evidence_count[mid] += u256(1)
        evidence_index = self.market_evidence_count[mid]
        key = self._evidence_key(mid, evidence_index)
        self.evidence_url[key] = self._clip(url, 500)
        self.evidence_note[key] = self._clip(note, 700)
        self.evidence_submitter[key] = gl.message.sender_address
        return evidence_index

    @gl.public.write
    def open_dispute(self, market_id: int, note: str) -> u256:
        mid = u256(market_id)
        if mid == u256(0) or mid > self.market_count:
            raise UserError("Invalid market id")
        if self.market_status[mid] != "RESOLVED":
            raise UserError("Only resolved markets can be disputed")
        if len(note) < 20:
            raise UserError("Dispute note is too short")

        self.market_dispute_count[mid] += u256(1)
        dispute_index = self.market_dispute_count[mid]
        key = self._dispute_key(mid, dispute_index)
        self.dispute_note[key] = self._clip(note, 900)
        self.dispute_submitter[key] = gl.message.sender_address
        self.dispute_status[key] = "OPEN"
        return dispute_index

    @gl.public.write
    def pause_market(self, market_id: int) -> None:
        mid = u256(market_id)
        if mid == u256(0) or mid > self.market_count:
            raise UserError("Invalid market id")
        if gl.message.sender_address != self.market_creator[mid] and gl.message.sender_address != self.owner:
            raise UserError("Only market creator or owner can pause")
        if self.market_status[mid] != "OPEN":
            raise UserError("Only open markets can be paused")
        self.market_status[mid] = "PAUSED"
        self.market_resolution_note[mid] = "Market paused by creator or protocol owner."

    @gl.public.write
    def resume_market(self, market_id: int) -> None:
        mid = u256(market_id)
        if mid == u256(0) or mid > self.market_count:
            raise UserError("Invalid market id")
        if gl.message.sender_address != self.market_creator[mid] and gl.message.sender_address != self.owner:
            raise UserError("Only market creator or owner can resume")
        if self.market_status[mid] != "PAUSED":
            raise UserError("Only paused markets can be resumed")
        self.market_status[mid] = "OPEN"
        self.market_resolution_note[mid] = "Market resumed. Trading is open."

    @gl.public.write
    def cancel_market(self, market_id: int, note: str) -> None:
        mid = u256(market_id)
        if mid == u256(0) or mid > self.market_count:
            raise UserError("Invalid market id")
        if gl.message.sender_address != self.market_creator[mid] and gl.message.sender_address != self.owner:
            raise UserError("Only market creator or owner can cancel")
        if self.market_status[mid] == "RESOLVED":
            raise UserError("Resolved markets cannot be canceled")
        self.market_status[mid] = "CANCELED"
        self.market_resolution_note[mid] = self._clip(note, 900)

    @gl.public.write
    def resolve_market(self, market_id: int) -> u256:
        mid = u256(market_id)
        if mid == u256(0) or mid > self.market_count:
            raise UserError("Invalid market id")
        if gl.message.sender_address != self.market_creator[mid] and gl.message.sender_address != self.owner:
            raise UserError("Only market creator or owner can resolve")
        if self.market_status[mid] != "OPEN":
            raise UserError("Market is not open")
        self.market_status[mid] = "RESOLVING"

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

    @gl.public.write
    def claim_winnings(self, market_id: int, outcome_index: int) -> u256:
        mid = u256(market_id)
        oid = u256(outcome_index)
        if mid == u256(0) or mid > self.market_count:
            raise UserError("Invalid market id")
        if self.market_status[mid] != "RESOLVED":
            raise UserError("Market is not resolved")
        if self.market_resolved_outcome[mid] != oid:
            raise UserError("Outcome did not win")

        user_key = self._user_key(mid, oid, gl.message.sender_address)
        position = self.user_position_cents[user_key]
        if position == u256(0):
            raise UserError("No winning position")
        total = self._total_pool(mid)
        winning_pool = self.outcome_pool_cents[self._key(mid, oid)]
        payout = (position * total) // winning_pool
        self.user_position_cents[user_key] = u256(0)
        self.user_claimed_cents[user_key] += payout
        return payout

    @gl.public.view
    def get_total_markets(self) -> u256:
        return self.market_count

    @gl.public.view
    def get_market_id_by_external_id(self, external_id: str) -> u256:
        return self.external_market_to_id[self._external_key(external_id)]

    @gl.public.view
    def get_market(self, market_id: int) -> dict:
        mid = u256(market_id)
        if mid == u256(0) or mid > self.market_count:
            raise UserError("Invalid market id")
        return {
            "id": str(mid),
            "external_id": self.market_external_id[mid],
            "creator": str(self.market_creator[mid]),
            "title": self.market_title[mid],
            "category": self.market_category[mid],
            "rules": self.market_rules[mid],
            "source_url": self.market_source_url[mid],
            "status": self.market_status[mid],
            "outcome_count": str(self.market_outcome_count[mid]),
            "resolved_outcome": str(self.market_resolved_outcome[mid]),
            "resolution_note": self.market_resolution_note[mid],
            "fee_bps": str(self.market_fee_bps[mid]),
            "volume_cents": str(self.market_volume_cents[mid]),
            "liquidity_cents": str(self.market_liquidity_cents[mid]),
            "protocol_fee_cents": str(self.market_fee_cents[mid]),
            "evidence_count": str(self.market_evidence_count[mid]),
            "dispute_count": str(self.market_dispute_count[mid]),
        }

    @gl.public.view
    def get_outcome(self, market_id: int, outcome_index: int) -> dict:
        mid = u256(market_id)
        oid = u256(outcome_index)
        if mid == u256(0) or mid > self.market_count:
            raise UserError("Invalid market id")
        self._assert_outcome(mid, oid)
        key = self._key(mid, oid)
        return {
            "market_id": str(mid),
            "outcome_index": str(oid),
            "name": self.outcome_name[key],
            "pool_cents": str(self.outcome_pool_cents[key]),
            "price_cents": str(self._price_cents(mid, oid)),
        }

    @gl.public.view
    def get_quote(self, market_id: int, outcome_index: int, amount_cents: int, side: str) -> dict:
        mid = u256(market_id)
        oid = u256(outcome_index)
        if mid == u256(0) or mid > self.market_count:
            raise UserError("Invalid market id")
        self._assert_outcome(mid, oid)
        amount = u256(amount_cents)
        price_before = self._price_cents(mid, oid)
        fee = (amount * self.market_fee_bps[mid]) // u256(10000)
        net = amount - fee
        total_before = self._total_pool(mid)
        impact_bps = (amount * u256(10000)) // (total_before + amount)
        return {
            "market_id": str(mid),
            "outcome_index": str(oid),
            "side": side,
            "price_before_cents": str(price_before),
            "fee_cents": str(fee),
            "net_cents": str(net),
            "impact_bps": str(impact_bps),
        }

    @gl.public.view
    def get_quote_by_external_id(self, external_id: str, outcome_index: int, amount_cents: int, side: str) -> dict:
        mid = self.external_market_to_id[self._external_key(external_id)]
        if mid == u256(0):
            raise UserError("External market is not created")
        return self.get_quote(int(mid), outcome_index, amount_cents, side)

    @gl.public.view
    def get_position(self, market_id: int, outcome_index: int, user: Address) -> u256:
        return self.user_position_cents[self._user_key(u256(market_id), u256(outcome_index), user)]

    @gl.public.view
    def get_liquidity_position(self, market_id: int, user: Address) -> u256:
        return self.user_liquidity_cents[self._liquidity_key(u256(market_id), user)]

    @gl.public.view
    def get_evidence(self, market_id: int, evidence_index: int) -> dict:
        mid = u256(market_id)
        index = u256(evidence_index)
        if mid == u256(0) or mid > self.market_count:
            raise UserError("Invalid market id")
        if index == u256(0) or index > self.market_evidence_count[mid]:
            raise UserError("Invalid evidence id")
        key = self._evidence_key(mid, index)
        return {
            "market_id": str(mid),
            "evidence_index": str(index),
            "url": self.evidence_url[key],
            "note": self.evidence_note[key],
            "submitter": str(self.evidence_submitter[key]),
        }

    @gl.public.view
    def get_dispute(self, market_id: int, dispute_index: int) -> dict:
        mid = u256(market_id)
        index = u256(dispute_index)
        if mid == u256(0) or mid > self.market_count:
            raise UserError("Invalid market id")
        if index == u256(0) or index > self.market_dispute_count[mid]:
            raise UserError("Invalid dispute id")
        key = self._dispute_key(mid, index)
        return {
            "market_id": str(mid),
            "dispute_index": str(index),
            "note": self.dispute_note[key],
            "submitter": str(self.dispute_submitter[key]),
            "status": self.dispute_status[key],
        }
