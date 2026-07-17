import net from "node:net";
export default function ping(host, port, timeout) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        const finish = (reachable) => {
            socket.removeAllListeners();
            socket.destroy();
            resolve(reachable);
        };
        socket.setTimeout(timeout);
        socket.once("connect", () => finish(true));
        socket.once("timeout", () => finish(false));
        socket.once("error", () => finish(false));
        socket.connect(port, host);
    });
}
