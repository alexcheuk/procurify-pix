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
            console.log('Handshake Socket: ', socket.id);

            user.roomKey = getUserKey(user);

            socket.user = user;

            rooms[socket.user.roomKey] = rooms[socket.user.roomKey] || {
                receiver : [],
                uploaders : []
            };

            console.log(role + ' ' + socket.user.email + ' joining room ' + socket.user.roomKey);

            socket.user.room = rooms[socket.user.roomKey];

            socket.join(socket.user.roomKey, function(){
                console.log(role + ' ' + socket.user.email + ' joined room: ' + socket.user.roomKey);

                if(socket.user.role === 'receiver'){
                    socket.user.room.receiver.push(socket);

                    console.log('receiver socket join: ', socket.id, socket.user.room.receiver.length);
                }else{
                    socket.user.room.uploaders.push(socket);

                    console.log('uploader socket join: ', socket.id, socket.user.room.uploaders.length);
                }

                if(socket.user.room.receiver && socket.user.room.receiver.length && socket.user.room.uploaders.length){
                    console.log('Room Ready!: ' + socket.user.roomKey);
                	io.to(socket.user.roomKey).emit('paired');
                }
            });
        });

        socket.on('image-upload', function(imageData){
            var user = socket.user;

            console.log('Image Uploaded from Client ['+ user.email +']: ', imageData);

            for (var i = 0; i < socket.user.room.receiver.length; i++) {
                var receiver = socket.user.room.receiver[i];

                receiver.emit('image-uploaded', imageData);
            };
        });

        socket.on('disconnect', function(){
            if(!socket.user) return;

            if(socket.user.role === 'receiver'){

                for (var i = 0; i < socket.user.room.receiver.length; i++) {
                    var receiver = socket.user.room.receiver[i];

                    if(receiver.id === socket.id){
                        console.log('Receiver Left');
                        socket.user.room.receiver.splice(i,1);
                        break;
                    }
                };
            }else{
                for (var i = 0; i < socket.user.room.uploaders.length; i++) {
                    var uploader = socket.user.room.uploaders[i];

                    if(uploader.id === socket.id){
                        console.log('Uploader Left');
                        socket.user.room.uploaders.splice(i,1);
                        break;
                    }
                };
            }

            if(socket.user.room.receiver.length === 0 || socket.user.room.uploaders.length === 0){
                io.to(socket.user.roomKey).emit('not-ready');
                console.log('Not Ready: '+ socket.user.roomKey);
            }
        });
    });

};