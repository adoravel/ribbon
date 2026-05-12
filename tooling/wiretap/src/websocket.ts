function close(ws: WebSocket, code?: number, reason?: string): void {
	try {
		if (ws.readyState < WebSocket.CLOSING) ws.close(code, reason);
	} catch { /* no-op */ }
}

export default function websocket(request: Request, upstream: URL): Response {
	const { socket: client, response } = Deno.upgradeWebSocket(request);
	const server = new WebSocket(upstream.toString());

	server.binaryType = "arraybuffer";

	const pending: (string | ArrayBuffer)[] = [];

	client.addEventListener("message", ({ data }) => {
		server.readyState === WebSocket.OPEN
			? server.send(data)
			: pending.push(data);
	});
	client.addEventListener(
		"close",
		({ code, reason }) => close(server, code, reason),
	);
	client.addEventListener("error", () => close(server, 1011));

	server.addEventListener("open", () => {
		for (const msg of pending.splice(0)) server.send(msg);
	});
	server.addEventListener("message", ({ data }) => {
		if (client.readyState === WebSocket.OPEN) client.send(data);
	});
	server.addEventListener(
		"close",
		({ code, reason }) => close(client, code, reason),
	);
	server.addEventListener("error", () => close(client, 1011));

	return response;
}
