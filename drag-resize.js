/* 
 Released under the MIT LICENSE or GNU LESSER GENERAL PUBLIC LICENSE  Version 3
 mingodad_at_gmail_dot_com
*/

dad = {};

dad.strHasWord = function(str, word){
	var found = str.indexOf(word);
	while(found >= 0) {
		if(found === 0){
			if( (str.length === word.length) ||
				(dad.isSpace(str[word.length])) ) return true;
		} else {
			if( dad.isSpace(str[found-1]) ) {
				if( (str.length === found+word.length) ||
					(dad.isSpace(str[found+word.length]))) return true;
			}
		}
		found = str.indexOf(word, found+1);
	}
	return false;
};

dad.strRemoveWord = function(str, word){
	var found = str.indexOf(word);
	while(found >= 0) {
		if(found === 0){
			if(str.length === word.length) return "";
			if(dad.isSpace(str[word.length])) return str.substring(word.length+1);
		} else {
			if( dad.isSpace(str[found-1]) ) {
				var lastPos = found+word.length;
				if(str.length === lastPos) {
					return str.substring(0, found-1);
				}
				if(dad.isSpace(str[lastPos])) {
					return str.substring(0, found-1) + str.substring(lastPos);
				}
			}
		}
		found = str.indexOf(word, found+1);
	}
	return str;
};

if('classList' in document)
{
	dad.hasClass = function(elm, className) {
		return className && elm.classList.indexOf(className) >= 0;
	};

	dad.addClass = function(elm, className) {
		if(className)
		{
			if(elm.classList.indexOf(className) >= 0) return;
			elm.classList.add(className);
		}
	};

	dad.removeClass = function(elm, className) {
		elm.classList.remove(className);
	};	
} else {
	dad.hasClass = function(elm, className) {
		var elm_className = elm.className;
		return elm_className && dad.strHasWord(elm_className, className);
	};

	dad.addClass = function(elm, className) {
		if(dad.hasClass(elm, className)) return;
		var elm_className = elm.className;
		if(elm_className) elm.className = elm_className + " " + className;
		else elm.className = className;
	};

	dad.removeClass = function(elm, className) {
		elm.className = dad.strRemoveWord(elm.className, className);
	};
}

dad.toggleClass = function(elm, className, doAdd) {
	if(doAdd) {
		dad.addClass(elm, className);
		return;
	}
	dad.removeClass(elm, className);
};

dad.getAsPixels = function(x){ return x + "px";};
dad.getEventSource = function(evt) {
	var target = evt.target ? evt.target : evt.srcElement;
	return (target.nodeType === 3) ? target.parentNode : target;
};
dad.getOffsetX = function(evt) {return evt.changedTouches ? evt.changedTouches[0].offsetX : evt.offsetX || evt.layerX;};
dad.getOffsetY = function(evt) {return evt.changedTouches ? evt.changedTouches[0].offsetY : evt.offsetY || evt.layerY;};
dad.getClientX = function(evt) {return evt.changedTouches ? evt.changedTouches[0].pageX : evt.clientX;};
dad.getClientY = function(evt) {return evt.changedTouches ? evt.changedTouches[0].pageY : evt.clientY;};

dad.getMousePos = function (evt){
	if (('targetTouches' in evt) && evt.targetTouches.length){
		var t = evt.targetTouches[0];
		 return { x: t.pageX, y: t.pageY };
	} else if (evt.pageX || evt.pageY)
		 return { x: evt.pageX, y: evt.pageY };
	else {
		var delm = document.documentElement;
		var bdy = document.body;
		return { x: evt.clientX + delm.scrollLeft - bdy.clientLeft,
							y: evt.clientY + delm.scrollTop  - bdy.clientTop };
	}
};

if( ('documentElement' in document) && ('scrollTop' in document.documentElement) ){
	dad.getScrolledX = function() {return document.documentElement.scrollLeft;};
	dad.getScrolledY = function() {return document.documentElement.scrollTop;};
} else {
	dad.getScrolledX = function() {return document.body.scrollLeft;};
	dad.getScrolledY = function() {return document.body.scrollTop;};
}
if( ('documentElement' in document) && ('clientHeight' in document.documentElement) ){
	dad.getClientWidth = function() {return document.documentElement.clientWidth;};
	dad.getClientHeight = function() {return document.documentElement.clientHeight;};
} else {
	dad.getClientWidth = function() {return document.body.clientWidth;};
	dad.getClientHeight = function() {return document.body.clientHeight;};
}
dad.checkEvent = function(evt) {return evt || window.event;};
dad.getEventKey = function(evt){
	var key = ('charCode' in evt) ? evt.charCode:
		(('keyCode' in evt) ? evt.keyCode: (('which' in evt) ? evt.which : 0));
	return key;
};

dad.addEvent = 'addEventListener' in window ? 
	function(obj,evt,fn) {obj.addEventListener(evt,fn,false);} :
	function(obj,evt,fn) {obj.attachEvent('on'+evt,fn);};

dad.removeEvent = 'removeEventListener' in window ?
	function(obj,evt,fn) {obj.removeEventListener(evt,fn,false);} :
	function(obj,evt,fn) {obj.detachEvent('on'+evt,fn);};
	
dad.cancelEvent = 'addEventListener' in window ? 
	function (e, c) {e.preventDefault(); if (c) e.stopPropagation();}:
	function (e, c) {'preventDefault' in e ? e.preventDefault() : e.returnValue = false; if (c) e.cancelBubble = true;};

dad.addEventMulti = function(obj, evts, fn){
	var ary = evts.split(' ');
	for(var i in ary) dad.addEvent(obj, ary[i], fn);
};

dad.removeEventMulti = function(obj, evts, fn){
	var ary = evts.split(' ');
	for(var i in ary) dad.removeEvent(obj, ary[i], fn);
};

dad.dragDrop = {
	keySpeed: 10, // pixels per keypress event
	initialMouseX: undefined,
	initialMouseY: undefined,
	startX: undefined,
	startY: undefined,
	dXKeys: undefined,
	dYKeys: undefined,
	startTime: undefined,
	draggedObject: undefined,
	initElement: function (element, dragThisObj, keyboardLink) {
		var dd = dad.dragDrop;
		if (typeof element === 'string') element = $id(element);
		element.onmousedown = dd.startDragMouse;
		element.ontouchstart = dd.startDragMouse;
		element._dragThisObj = dragThisObj;
		if(keyboardLink) {
			if (typeof keyboardLink === 'string')
				keyboardLink = $id(keyboardLink);
			keyboardLink.relatedElement = element;
			keyboardLink.onclick = dd.startDragKeys;
		}
	},
	startDragMouse: function (e) {
		var dd = dad.dragDrop;
		dd.startDrag(this);
		var evt = dad.checkEvent(e);
		var pos = dad.getMousePos(evt);
		dd.initialMouseX = pos.x; //dad.getClientX(evt);
		dd.initialMouseY = pos.y; //dad.getClientY(evt);
		dad.addEventMulti(document,'mousemove touchmove',dd.dragMouse);
		dad.addEventMulti(document,'mouseup touchend',dd.releaseElement);
		return false;
	},
	startDragKeys: function () {
		var dd = dad.dragDrop;
		dd.startDrag(this.relatedElement);
		dd.dXKeys = dd.dYKeys = 0;
		dad.addEvent(document,'keydown',dd.dragKeys);
		dad.addEvent(document,'keypress',dd.switchKeyEvents);
		this.blur();
		return false;
	},
	startDrag: function (obj) {
		var dd = dad.dragDrop;
		if (dd.draggedObject) dd.releaseElement();
		var dragThisObj = obj._dragThisObj ? obj._dragThisObj : obj;
		//dad.bringToFront(dragThisObj);
		dd.startTime = new Date().getTime();
		dd.startX = dragThisObj.offsetLeft;
		dd.startY = dragThisObj.offsetTop;
		dd.draggedObject = dragThisObj;
		dad.addClass(obj, 'dragged');
		if(dragThisObj.onStartDragging)  dragThisObj.onStartDragging();
	},
	dragMouse: function (e) {
		var dd = dad.dragDrop;
		var evt = dad.checkEvent(e);
		var pos = dad.getMousePos(evt);
		var dX = pos.x - dd.initialMouseX; //dad.getClientX(evt) - dd.initialMouseX;
		var dY = pos.y - dd.initialMouseY; //dad.getClientY(evt) - dd.initialMouseY;
		dd.setPosition(dX,dY);
		return false;
	},
	dragKeys: function(e) {
		var dd = dad.dragDrop;
		var evt = dad.checkEvent(e);
		var key = evt.keyCode;
		switch (key) {
			case 37:	// left
			case 63234:
				dd.dXKeys -= dd.keySpeed;
				break;
			case 38:	// up
			case 63232:
				dd.dYKeys -= dd.keySpeed;
				break;
			case 39:	// right
			case 63235:
				dd.dXKeys += dd.keySpeed;
				break;
			case 40:	// down
			case 63233:
				dd.dYKeys += dd.keySpeed;
				break;
			case 13: 	// enter
			case 27: 	// escape
				dd.releaseElement();
				return false;
			default:
				return true;
		}
		dd.setPosition(dd.dXKeys,dd.dYKeys);
		dad.cancelEvent(evt);
		return false;
	},
	setPosition: function (dx,dy) {
		var dd = dad.dragDrop;
		var style = dd.draggedObject.style;
		var xpos = dd.startX + dx;
		if(xpos < 0) xpos = 0;
		var ypos = dd.startY + dy;
		if(ypos < 0) ypos = 0;
console.log(dx, dy, xpos, ypos);
		style.left = dad.getAsPixels(xpos);
		style.top = dad.getAsPixels(ypos);
		dd.updatePending = false;
	},
	switchKeyEvents: function () {
		// for Opera and Safari 1.3
		var dd = dad.dragDrop;
		dad.removeEventMulti(document,'keydown keypress',dd.dragKeys);
		dad.removeEvent(document,'keypress',dd.switchKeyEvents);
	},
	releaseElement: function() {
		var dd = dad.dragDrop;
		var dobj = dd.draggedObject;
		if(!dobj) return;
		var removeEvent = dad.removeEvent;
		var removeEventMulti = dad.removeEventMulti;
		removeEventMulti(document,'mousemove touchmove',dd.dragMouse);
		removeEventMulti(document,'mouseup touchend',dd.releaseElement);
		removeEventMulti(document,'keypress keydown',dd.dragKeys);
		removeEvent(document,'keypress',dd.switchKeyEvents);
		dad.removeClass(dobj, 'dragged');
		if(dobj.onStopDragging)  dobj.onStopDragging();
		dd.draggedObject = null;
	}
};

dad.RESIZE_DIR = {
	north: 0x01,
	south: 0x02,
	east: 0x04,
	west: 0x08
};
var tmp = dad.RESIZE_DIR;
dad.CursorResizeDirection = new Array(tmp.west+1);
var tmp2 = dad.CursorResizeDirection;
tmp2[tmp.north] = "n-resize";
tmp2[tmp.south] = "s-resize";
tmp2[tmp.east] = "e-resize";
tmp2[tmp.west] = "w-resize";
tmp2[tmp.north | tmp.east] = "ne-resize";
tmp2[tmp.south | tmp.east] = "se-resize";
tmp2[tmp.north | tmp.west] = "nw-resize";
tmp2[tmp.south | tmp.west] = "sw-resize";

//Find out what kind of resize! Return a string inlcluding the directions
dad.getResizeDirection = function(el, evt) {
	var xPos, yPos, offset, dir;
	dir = 0;

	xPos = dad.getOffsetX(evt);
	yPos = dad.getOffsetY(evt);

	offset = 8; //The distance from the edge in pixels

	//console.log(yPos, el.offsetTop, el.offsetHeight);
	if (yPos<offset) dir |= dad.RESIZE_DIR.north;
	else if (yPos > el.offsetHeight-offset) dir |= dad.RESIZE_DIR.south;
	if (xPos<offset) dir |= dad.RESIZE_DIR.west;
	else if (xPos > el.offsetWidth-offset) dir |= dad.RESIZE_DIR.east;

	return dir;
};

dad._resizingObject = null;

function dragResizeOnMouseUp(event)
{
	dad.removeEvent(window, "mousemove", dragResizeOnMouseMove);
	dad.removeEvent(window, "mouseup", dragResizeOnMouseUp);
}

function dragResizeOnMouseMove(event)
{
	
}

function dragResizeOnMouseDown(event)
{
	var target = dad.getEventSource(event);
	if(target && target !== window)
	{
		if(target.style.cursor === "move")
		{
			dad.addEvent(window, "mousemove", dragResizeOnMouseMove);
			dad.addEvent(window, "mouseup", dragResizeOnMouseUp);
		}
	}	
}

function dragResizeOnMouseOver(event)
{
	var target = dad.getEventSource(event);
	if(target && target !== window)
	{
		//console.log(target);
		var rszicon = dad.getResizeDirection(target, event);
		//console.log(rszicon);
		if(rszicon)
		{
			var dir = dad.CursorResizeDirection[rszicon];
			target.style.cursor = dir;
			dad.dragDrop.releaseElement();
		} else {
			target.style.cursor = "move";
			dad.dragDrop.initElement(target);
		}
	}
}
