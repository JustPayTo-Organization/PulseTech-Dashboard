export const CLIENT_DISPLAY_NAME_MAP: Record<string, string> = {
    vlpay: "VLPay",
};

export const getDisplayNameFromUsername = (username: string) =>
    CLIENT_DISPLAY_NAME_MAP[username] || username;