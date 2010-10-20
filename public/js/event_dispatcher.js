/* Abstract event binding
Example:

    var MyEventEmitter = function(){};
    MyEventEmitter.prototype = new AbstractEventsDispatcher;

    var emitter = new MyEventEmitter();

    // Bind to single event
    emitter.bind('foo_event', function(data){ alert(data)} );

    // Bind to all
    emitter.bind_all(function(event_name, data){ alert(data) });

    // Bind to all except some
    emitter.bind_all_except(['except_this_one', 'and_this_one'], function(event_name, data){ alert(data) });

--------------------------------------------------------*/
var AbstractEventsDispatcher = function(){};
AbstractEventsDispatcher.prototype = {
  callbacks: {},
  global_callbacks: [],
  
  bind: function(event_name, callback){
    this.callbacks[event_name] = this.callbacks[event_name] || [];
    this.callbacks[event_name].push(callback);
    return this;// chainable
  },
  
  trigger: function(event_name, data){
    this.dispatch(event_name, data);
    this.dispatch_global(event_name, data);
    return this;
  },

  bind_all: function(callback){
    this.global_callbacks.push(callback);
    return this;
  },
  
  bind_all_except: function(except, handler){
    this.bind_all(function(event_name, event_data){
      if(except.indexOf(event_name) > -1) return false;
      handler(event_name, event_data)
    });
    return this
  },
  
  dispatch: function(event_name, data){
    var chain = this.callbacks[event_name];
    if(typeof chain == 'undefined') return; // no callbacks for this event
    for(var i = 0; i < chain.length; i++){
      chain[i]( data )
    }
  },
  
  dispatch_global: function(event_name, data){
    for(var i = 0; i < this.global_callbacks.length; i++){
      this.global_callbacks[i]( event_name, data )
    }
  }
  
};

var Socket = function(){
  this.connect();
  var self = this;
  
  this
    .bind('open', function () {
      Socket.log('Open connection to ' + self.url())
    })
    .bind('close', function () {
      Socket.log('Socket was closed')
    })
    .bind_all(function (event, message) {
      Socket.log('Message received: ', event, message)
    });
  
};