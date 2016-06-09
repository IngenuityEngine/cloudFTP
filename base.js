
// Vendor Modules
/////////////////////////
var _ = require('lodash')
var Class = require('uberclass')

// Our Modules
/////////////////////////
// var helpers = require('coren/node_modules/arkutil')


// Create local references to array methods we'll to use later.
var array = []
var slice = array.slice

// A difficult-to-believe, but optimized internal dispatch function for
// triggering events. Tries to keep the usual cases speedy (most internal
// events have 3 arguments).
function triggerEvents(events, args)
{
	var ev, i = -1, l = events.length
	var a1 = args[0], a2 = args[1], a3 = args[2]

	switch (args.length)
	{
		case 0:
			i += 1
			while (i < l)
			{
				ev = events[i]
				ev.callback.call(ev.ctx)
				i += 1
			}
			return
		case 1:
			i += 1
			while (i < l)
			{
				ev = events[i]
				ev.callback.call(ev.ctx, a1)
				i += 1
			}
			return
		case 2:
			i += 1
			while (i < l)
			{
				ev = events[i]
				ev.callback.call(ev.ctx, a1, a2)
				i += 1
			}
			return
		case 3:
			i += 1
			while (i < l)
			{
				ev = events[i]
				ev.callback.call(ev.ctx, a1, a2, a3)
				i += 1
			}
			return
		default:
			i += 1
			while (i < l)
			{
				ev = events[i]
				ev.callback.apply(ev.ctx, args)
				i += 1
			}
	}
}

// Inversion-of-control versions of `on` and `once`. Tell *this* object to
// listen to an event in another object ... keeping track of what it's
// listening to.
function listen(implementation)
{
	return function(obj, name, callback)
	{
		var listeners = this._listeners || (this._listeners = {})
		obj._listenerID = obj._listenerID || _.uniqueId('l')
		var id = obj._listenerID

		listeners[id] = obj
		if (typeof name == 'object')
			callback = this

		obj[implementation](name, callback, this)
		return this
	}
}

// Backbone.Events
// ---------------

// A module that can be mixed in to *any object* in order to provide it with
// custom events. You may bind with `on` or remove with `off` callback
// functions to an event; `trigger`-ing an event fires all callbacks in
// succession.
//
//     var object = {};
//     _.extend(object, Backbone.Events);
//     object.on('expand', function(){ alert('expanded'); });
//     object.trigger('expand');
//
module.exports = Class.extend({

// Method: setOptions
// Add options to the class's options,
// overwriting any that already exist
setOptions: function(key, val)
{
	var options
	if (_.isObject(key))
		options = key
	else
		(options = {})[key] = val

	// the _.pick ensures that we only set options that this
	// class can use
	this.options = _.extend(
		_.clone(this.defaultOptions),
		this.options,
		options)
	// fix: implement pick
		// _.pick(options, _.keys(this.defaultOptions)))

	return this
},

// Bind an event to a `callback` function. Passing `"all"` will bind
// the callback to all events fired.
on: function(name, callback, context)
{
	this._events = this._events || {}
	var events = this._events[name] || (this._events[name] = [])
	events.push({
		callback: callback,
		context: context,
		ctx: context || this
	})
	return this
},

// Bind an event to only be triggered a single time. After the first time
// the callback is invoked, it will be removed.
once: function(name, callback, context)
{
	var self = this
	var once = _.once(function()
	{
		self.off(name, once)
		callback.apply(this, arguments)
	})
	once._callback = callback
	return this.on(name, once, context)
},

// Remove one or many callbacks. If `context` is null, removes all
// callbacks with that function. If `callback` is null, removes all
// callbacks for the event. If `name` is null, removes all bound
// callbacks for all events.
off: function(name, callback, context)
{
	var retain, ev, events, names, i, l, j, k
	if (!this._events)
		return this

	if (!name && !callback && !context)
	{
		this._events = {}
		return this
	}

	names = name ? [name] : _.keys(this._events)
	for (i = 0, l = names.length; i < l; i+=1)
	{
		name = names[i]
		events = this._events[name]
		if (events)
		{
			this._events[name] = retain = []
			if (callback || context)
			{
				for (j = 0, k = events.length; j < k; j+=1)
				{
					ev = events[j]
					if ((callback &&
						callback !== ev.callback &&
						callback !== ev.callback._callback) ||
						(context && context !== ev.context))
					{
						retain.push(ev)
					}
				}
			}
			if (!retain.length)
				delete this._events[name]
		}
	}

	return this
},

// Trigger one or many events, firing all bound callbacks. Callbacks are
// passed the same arguments as `trigger` is, apart from the event name
// (unless you're listening on `"all"`, which will cause your callback to
// receive the true name of the event as the first argument).
trigger: function(name)
{
	if (!this._events)
		return this

	var args = slice.call(arguments, 1)
	var events = this._events[name]
	var allEvents = this._events.all
	if (events)
		triggerEvents(events, args)
	if (allEvents)
		triggerEvents(allEvents, arguments)
	return this
},

// Tell this object to stop listening to either specific events ... or
// to every object it's currently listening to.
stopListening: function(obj, name, callback)
{
	var listeners = this._listeners
	if (!listeners)
		return this
	var deleteListener = !name && !callback
	if (typeof name === 'object')
		callback = this
	if (obj)
	{
		listeners = {}
		listeners[obj._listenerID] = obj
	}
	for (var id in listeners)
	{
		listeners[id].off(name, callback, this)
		if (deleteListener)
			delete this._listeners[id]
	}
	return this
},

listenTo: listen('on'),
listenToOnce: listen('once'),

// end of module
})

