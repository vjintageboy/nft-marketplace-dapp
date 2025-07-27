import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const address1 = accounts.get("wallet_1")!;
const address2 = accounts.get("wallet_2")!;

describe("Bounty Contract", () => {
  it("should create a bounty successfully", () => {
    const createBountyResult = simnet.callPublicFn(
      "bounty-contract",
      "create-bounty",
      [Cl.stringAscii("Build a website"), Cl.uint(1000)],
      address1
    );

    expect(createBountyResult.result).toBeOk(Cl.uint(1));
  });

  it("should get bounty details", () => {
    // First create a bounty
    simnet.callPublicFn(
      "bounty-contract",
      "create-bounty",
      [Cl.stringAscii("Build a website"), Cl.uint(1000)],
      address1
    );

    const getBountyResult = simnet.callReadOnlyFn(
      "bounty-contract",
      "get-bounty",
      [Cl.uint(1)],
      address1
    );

    expect(getBountyResult.result).toBeSome(
      Cl.tuple({
        creator: Cl.principal(address1),
        amount: Cl.uint(1000),
        description: Cl.stringAscii("Build a website"),
        status: Cl.stringAscii("open"),
        submitter: Cl.none(),
        submission: Cl.none(),
      })
    );
  });

  it("should submit work to a bounty", () => {
    // First create a bounty
    simnet.callPublicFn(
      "bounty-contract",
      "create-bounty",
      [Cl.stringAscii("Build a website"), Cl.uint(1000)],
      address1
    );

    // Submit work
    const submitWorkResult = simnet.callPublicFn(
      "bounty-contract",
      "submit-work",
      [Cl.uint(1), Cl.stringAscii("Website completed: example.com")],
      address2
    );

    expect(submitWorkResult.result).toBeOk(Cl.bool(true));

    // Check bounty status
    const getBountyResult = simnet.callReadOnlyFn(
      "bounty-contract",
      "get-bounty",
      [Cl.uint(1)],
      address1
    );

    expect(getBountyResult.result).toBeSome(
      Cl.tuple({
        creator: Cl.principal(address1),
        amount: Cl.uint(1000),
        description: Cl.stringAscii("Build a website"),
        status: Cl.stringAscii("in-progress"),
        submitter: Cl.some(Cl.principal(address2)),
        submission: Cl.some(Cl.stringAscii("Website completed: example.com")),
      })
    );
  });

  it("should approve submission and transfer payment", () => {
    // First create a bounty
    simnet.callPublicFn(
      "bounty-contract",
      "create-bounty",
      [Cl.stringAscii("Build a website"), Cl.uint(1000)],
      address1
    );

    // Submit work
    simnet.callPublicFn(
      "bounty-contract",
      "submit-work",
      [Cl.uint(1), Cl.stringAscii("Website completed: example.com")],
      address2
    );

    // Get initial balance of worker
    const initialBalance = simnet.getAssetsMap().get("STX")?.get(address2) || 0n;

    // Approve submission
    const approveResult = simnet.callPublicFn(
      "bounty-contract",
      "approve-submission",
      [Cl.uint(1)],
      address1
    );

    expect(approveResult.result).toBeOk(Cl.bool(true));

    // Check that bounty status is completed
    const getBountyResult = simnet.callReadOnlyFn(
      "bounty-contract",
      "get-bounty",
      [Cl.uint(1)],
      address1
    );

    expect(getBountyResult.result).toBeSome(
      Cl.tuple({
        creator: Cl.principal(address1),
        amount: Cl.uint(1000),
        description: Cl.stringAscii("Build a website"),
        status: Cl.stringAscii("completed"),
        submitter: Cl.some(Cl.principal(address2)),
        submission: Cl.some(Cl.stringAscii("Website completed: example.com")),
      })
    );

    // Check that worker received payment
    const finalBalance = simnet.getAssetsMap().get("STX")?.get(address2) || 0n;
    expect(finalBalance).toBe(BigInt(initialBalance) + 1000n);
  });

  it("should cancel a bounty and refund creator", () => {
    // Get initial balance of creator
    const initialBalance = simnet.getAssetsMap().get("STX")?.get(address1) || 0n;

    // Create a bounty
    simnet.callPublicFn(
      "bounty-contract",
      "create-bounty",
      [Cl.stringAscii("Build a website"), Cl.uint(1000)],
      address1
    );

    // Cancel the bounty
    const cancelResult = simnet.callPublicFn(
      "bounty-contract",
      "cancel-bounty",
      [Cl.uint(1)],
      address1
    );

    expect(cancelResult.result).toBeOk(Cl.bool(true));

    // Check that bounty status is cancelled
    const getBountyResult = simnet.callReadOnlyFn(
      "bounty-contract",
      "get-bounty",
      [Cl.uint(1)],
      address1
    );

    expect(getBountyResult.result).toBeSome(
      Cl.tuple({
        creator: Cl.principal(address1),
        amount: Cl.uint(1000),
        description: Cl.stringAscii("Build a website"),
        status: Cl.stringAscii("cancelled"),
        submitter: Cl.none(),
        submission: Cl.none(),
      })
    );

    // Check that creator got refunded
    const finalBalance = simnet.getAssetsMap().get("STX")?.get(address1) || 0n;
    expect(finalBalance).toBe(BigInt(initialBalance));
  });

  it("should get bounty count", () => {
    const countResult = simnet.callReadOnlyFn(
      "bounty-contract",
      "get-bounty-count",
      [],
      address1
    );

    expect(countResult.result).toBeOk(Cl.uint(0));

    // Create a bounty
    simnet.callPublicFn(
      "bounty-contract",
      "create-bounty",
      [Cl.stringAscii("Build a website"), Cl.uint(1000)],
      address1
    );

    const countResultAfter = simnet.callReadOnlyFn(
      "bounty-contract",
      "get-bounty-count",
      [],
      address1
    );

    expect(countResultAfter.result).toBeOk(Cl.uint(1));
  });
});
