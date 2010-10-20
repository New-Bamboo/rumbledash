/* Periodically send out dummy events 
--------------------------------------------*/
var PusherMock = function( interval ){
  var self = this, 
      nextInterval = function(){
        return Math.round(Math.random() * interval * 2)
      },
      nextTick = function(){
        var event = Pusher.events[Math.floor(Math.random() * Pusher.events.length)];
        self.trigger(event.event, event.data);
        setTimeout(nextTick, nextInterval());
      }

  nextTick();
};

// Extend from AbstractEventsDispatcher 'bind' and 'trigger' methods
PusherMock.prototype = new AbstractEventsDispatcher;