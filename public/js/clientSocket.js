var connected = false;

var socket = io("http://localhost:8000");
socket.emit("setup", userLoggedIn);

socket.on("connected", () => connected = true);
socket.on("message received", (newMessage) => messageReceived(newMessage));

socket.on("notification received", (newNotification) => {
    console.log("Notification received on the client")
    $.get("/api/notifications/latest", (notificationData) => {
        showNotificationPopup(notificationData)
        refreshNotificationsBadge();
    })

})

socket.on("notification all received", (newNotification) => {
    showAll();
    refreshNotificationsBadge();
})

function emitNotification(userId)
{
    if(userId == userLoggedIn._id) return;

    socket.emit("notification received", userId);
}

function emitAll()
{
    socket.emit("notification all");
}