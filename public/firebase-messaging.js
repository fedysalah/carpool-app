
self.addEventListener('notificationclick', function(event) {  
    console.log('On notification click: ', event.notification.tag);  
    // Android doesn't close the notification when you click on it  
    // See: http://crbug.com/463146  
    event.notification.close();
  
    // This looks to see if the current is already open and  
    // focuses if it is  
    event.waitUntil(
      clients.matchAll({  
        type: "window"  
      })
      .then(function(clientList) {  
        for (var i = 0; i < clientList.length; i++) {  
          var client = clientList[i];  
          if (client.url == '/' && 'focus' in client)  
            return client.focus();  
        }  
        if (clients.openWindow) {
          return clients.openWindow('https://deanhume.github.io/typography');  
        }
      })
    );
  });
  

self.addEventListener("push", e => {
    const data = e.data.json();
    console.log("Push Recieved... !!!!!");
    self.registration.showNotification(data.title, {
      body: data.body,
     
      actions: [  
        {action: 'like', title: ' s Like', icon: data.icon},  
        {action: 'reply', title: 's Reply', icon: data.icon}
    ]  
    });
  });

