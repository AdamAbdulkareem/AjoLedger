import {
  GROUP_INVITE_POLL_INITIAL_MS,
  GROUP_INVITE_POLL_MAX_MS,
  nextInvitePollDelayMs,
} from "../groupInvite";
import { startInvitePolling } from "../invitePolling";

describe("nextInvitePollDelayMs", () => {
  it("doubles delay up to the configured maximum", () => {
    expect(nextInvitePollDelayMs(GROUP_INVITE_POLL_INITIAL_MS)).toBe(30_000);
    expect(nextInvitePollDelayMs(GROUP_INVITE_POLL_MAX_MS)).toBe(
      GROUP_INVITE_POLL_MAX_MS,
    );
  });
});

describe("startInvitePolling", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("resets delay when member count changes", async () => {
    let memberCount = 1;
    const poll = jest.fn(async () => {
      memberCount = 2;
    });

    const stop = startInvitePolling({
      enabled: true,
      poll,
      getMemberCount: () => memberCount,
    });

    await jest.advanceTimersByTimeAsync(GROUP_INVITE_POLL_INITIAL_MS);
    expect(poll).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(GROUP_INVITE_POLL_INITIAL_MS);
    expect(poll).toHaveBeenCalledTimes(2);

    stop();
  });
});
