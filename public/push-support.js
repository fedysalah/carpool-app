self.addEventListener('notificationclick', function (event) {
    console.log('On notification click: ', event.notification.tag);
    event.notification.close();
    event.waitUntil(
        clients.matchAll({
            type: "window"
        }).then(function () {
                if (clients.openWindow) {
                    return clients.openWindow('https://carpool.cleverapps.io/');
                }
            })
    );
});

self.addEventListener("push", e => {
    const data = e.data.json();
    console.log("Push Recieved... !!!!!");
    self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon
    });
});
