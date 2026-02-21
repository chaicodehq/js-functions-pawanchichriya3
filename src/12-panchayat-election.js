/**
 * 🗳️ Panchayat Election System - Capstone
 *
 * Village ki panchayat election ka system bana! Yeh CAPSTONE challenge hai
 * jisme saare function concepts ek saath use honge:
 * closures, callbacks, HOF, factory, recursion, pure functions.
 *
 * Functions:
 *
 *   1. createElection(candidates)
 *      - CLOSURE: private state (votes object, registered voters set)
 *      - candidates: array of { id, name, party }
 *      - Returns object with methods:
 *
 *      registerVoter(voter)
 *        - voter: { id, name, age }
 *        - Add to private registered set. Return true.
 *        - Agar already registered or voter invalid, return false.
 *        - Agar age < 18, return false.
 *
 *      castVote(voterId, candidateId, onSuccess, onError)
 *        - CALLBACKS: call onSuccess or onError based on result
 *        - Validate: voter registered? candidate exists? already voted?
 *        - If valid: record vote, call onSuccess({ voterId, candidateId })
 *        - If invalid: call onError("reason string")
 *        - Return the callback's return value
 *
 *      getResults(sortFn)
 *        - HOF: takes optional sort comparator function
 *        - Returns array of { id, name, party, votes: count }
 *        - If sortFn provided, sort results using it
 *        - Default (no sortFn): sort by votes descending
 *
 *      getWinner()
 *        - Returns candidate object with most votes
 *        - If tie, return first candidate among tied ones
 *        - If no votes cast, return null
 *
 *   2. createVoteValidator(rules)
 *      - FACTORY: returns a validation function
 *      - rules: { minAge: 18, requiredFields: ["id", "name", "age"] }
 *      - Returned function takes a voter object and returns { valid, reason }
 *
 *   3. countVotesInRegions(regionTree)
 *      - RECURSION: count total votes in nested region structure
 *      - regionTree: { name, votes: number, subRegions: [...] }
 *      - Sum votes from this region + all subRegions (recursively)
 *      - Agar regionTree null/invalid, return 0
 *
 *   4. tallyPure(currentTally, candidateId)
 *      - PURE FUNCTION: returns NEW tally object with incremented count
 *      - currentTally: { "cand1": 5, "cand2": 3, ... }
 *      - Return new object where candidateId count is incremented by 1
 *      - MUST NOT modify currentTally
 *      - If candidateId not in tally, add it with count 1
 *
 * @example
 *   const election = createElection([
 *     { id: "C1", name: "Sarpanch Ram", party: "Janata" },
 *     { id: "C2", name: "Pradhan Sita", party: "Lok" }
 *   ]);
 *   election.registerVoter({ id: "V1", name: "Mohan", age: 25 });
 *   election.castVote("V1", "C1", r => "voted!", e => "error: " + e);
 *   // => "voted!"
 */
export function createElection(candidates) {
  // Your code here
  let votes = [];
  let voters = new Set();
  let ids = new Set();
  return {
    registerVoter: (voter) => {
      if (!voter || typeof voter !== "object" || typeof voter.id === "undefined" || typeof voter.name !== "string" || typeof voter.age !== "number" || voter.age < 18) return false;
      if (ids.has(voter.id)) return false;
      voters.add({ ...voter });
      ids.add(voter.id)
      return true;
    },
    castVote: (voterId, candidateId, onSuccess, onError) => {
      if (!ids.has(voterId)) return onError("Voter not registered");
      const candidateExists = candidates.some((c) => c.id === candidateId);
      if (!candidateExists) return onError("Candidate does not exist");
      const hasAlreadyVoted = votes.some((v) => v.voterId === voterId);
      if (hasAlreadyVoted) return onError("Voter has already voted");

      const voteRecord = { voterId, candidateId };
      votes.push(voteRecord);
      return onSuccess(voteRecord);
    },
    getResults: (sortFn) => {
      const result = candidates.map(candidate => {
        const voteCount = votes.filter(v => v.candidateId === candidate.id).length;
        return {
          id: candidate.id,
          name: candidate.name,
          party: candidate.party,
          votes: voteCount
        };
      })
      if (typeof sortFn === "function") {
        return result.sort(sortFn);
      }

      return result.sort((a, b) => b.votes - a.votes)
    },
    getWinner: () => {
      if (votes.length === 0) return null;

      const result = candidates.map(candidate => {
        const voteCount = votes.filter(v => v.candidateId === candidate.id).length;
        return { candidate, votes: voteCount };
      });
      let maxVotes = -1;
      let winner = null;

      for (const r of result) {
        if (r.votes > maxVotes) {
          maxVotes = r.votes;
          winner = r.candidate;
        }
      }
      return winner;
    }
  }
}

export function createVoteValidator(rules) {
  // Your code here
  return function (voter) {
    if (!voter || typeof voter !== "object") return { valid: false, reason: "Invalid voter object" };

    const requiredFields = rules.requiredFields || [];
    for (const field of requiredFields) {
      if (!voter.hasOwnProperty(field)) {
        return { valid: false, reason: `Missing field: ${field}` };
      }
    }

    const minAge = rules.minAge || 18;
    if (typeof voter.age !== "number" || voter.age < minAge) {
      return { valid: false, reason: `Voter must be at least ${minAge} years old` };
    }
    return { valid: true, reason: "success" };
  };
}

export function countVotesInRegions(regionTree) {
  if (!regionTree || typeof regionTree !== "object") return 0;
  let totalVotes = typeof regionTree.votes === "number" ? regionTree.votes : 0;

  if (Array.isArray(regionTree.subRegions)) {
    for (const sub of regionTree.subRegions) {
      totalVotes += countVotesInRegions(sub);
    }
  }
  return totalVotes;
}

export function tallyPure(currentTally, candidateId) {
  return {
    ...currentTally,
    [candidateId]: (currentTally[candidateId] || 0) + 1
  };
}
