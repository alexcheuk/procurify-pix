'use strict';

module.exports = function (io) {

	var rooms = {};

    function getUserKey(user){
        return user.company.name.toLowerCase() + '_' + user.id;
    };

    io.on('connection', function (socket) {

        socket.on('handshake', function(user){
            var role = user.role || 'Uploader';

            console.log(role + ' Handhsaking: ' + user.email);

            user.roomKey = getUserKey(user);

            socket.user = user;

            rooms[user.roomKey] = rooms[user.roomKey] || {
                receiver : null,
                uploaders : []
            };

            socket.room = user.room = rooms[user.roomKey];
            
            socket.join(user.roomKey, function(){
                console.log(role + ' ' + user.email + ' joined room: ' + user.roomKey);

                if(user.role === 'receiver'){
                    user.room.receiver = socket;
                }else{
                    user.room.uploaders.push(socket);
                }

                if(user.room.receiver && user.room.uploaders.length){
                    console.log('Ready!');
                	io.to(user.roomKey).emit('paired');
                }
            });
        });

        socket.on('image-upload', function(imageData){
            console.log('Image Uploaded from Client');

            var user = socket.user;
            socket.room.receiver.emit('image-uploaded', imageData);
        });

        socket.on('disconnect', function(){
            if(!socket.user) return;

            if(socket.user.role === 'receiver'){
                console.log('Receiver Left');
                socket.room.receiver = null;
                io.to(socket.user.roomKey).emit('not-ready');
                return;
            }

            for (var i = 0; i < socket.room.uploaders.length; i++) {
                var uploader = socket.room.uploaders[i];

                if(uploader.id === socket.id){
                    console.log('Uploader Left');
                    socket.room.uploaders.splice(i,1);
                    break;
                }
            };
        });
    });

};