/*
 EvaLayoutManager without third party dependencies.
 Originally derived from 
 EvaLayout, Lay it be! 
 (http://www.codeproject.com/Articles/13891/EvaLayout-Lay-it-be)
 Copyright (c) 2014, Domingo Alvarez Duarte - mingodad[at]gmail[dot]com
 
 Released under the MIT LICENSE or GNU LESSER GENERAL PUBLIC LICENSE  Version 3
 at your choice, permission to release under this licenses was obtained from the
 original author Alejandro Xalabarder ales[at]elxala[dot]de
 
 */

function EvaWidgetInfo(wname, theHandle, originalRect, theParams)
{
	this.name = wname;      // name of the component in the layout array
	this.widgetId = theHandle;     // component window handle

	this.isLaidOut = false; // if the component has been found in the layout array
			// and therefore if indxPos is a valid calculated field
	this.iniRect = originalRect;   // place in the layout array mesured in array indices
			// left  = column index
			// right = last column index
			// top   = row index
			// right = last row index

	this.indxPos = {left : 0, right : 0, top : 0, bottom : 0};   // initial pos and size of the component
        this.params = theParams;
}
   
function EvaLayoutManager()
{
	var self = this;
	var HEADER_ADAPT = "A";
	var HEADER_EXPAND = "X";
	var EXPAND_HORIZONTAL = "-";
	var EXPAND_VERTICAL =  "+";

	var isPrecalculated = false;
	var Hmargin = 0;
	var Vmargin = 0;
	var Hgap = 0;
	var Vgap = 0;
	var fijoH = 0;
	var fijoV = 0;

	var Hpos = [];
	var Hdim = [];
	var HextraPos = [];

	var Vdim = [];
	var Vpos = [];
	var VextraPos = [];

	var columnsReparto = [];
	var rowsReparto = [];

	var componentArray = [];
	var componentArrayIdx = {};
	var evaLayout = null;
        var evaLayoutParams = {};
	
	this.setLayout = function(layoutInfo)
	{
                evaLayoutParams = {};
		if(typeof layoutInfo === "string")
		{
                        var reParams = /\(([^\)]+)\)/;
			var linfo = [];
			var lines = layoutInfo.split('\n');
			var lines_len = lines.length;
			var maxcols = 0;
			for(var i=0; i < lines_len; ++i)
			{
				var rec = lines[i].split(',');
				var rec_len = rec.length;
				if(rec_len === 1) continue; //ignore blank lines
				for(var j=0; j < rec_len; ++j)
				{
					var rec_trimed = rec[j].trim();
                                        var hasParams = rec_trimed.indexOf("(");
                                        if(hasParams >= 0)
                                        {
                                            var params = reParams.exec(rec_trimed);
                                            rec_trimed = rec_trimed.substr(0, hasParams);
                                            if(params)
                                            {
                                                evaLayoutParams[rec_trimed] = params[1];
                                            }
                                        }
					rec[j] = rec_trimed;
				}
				if(rec_len > maxcols)
				{
					maxcols = rec_len;
				}
				linfo.push(rec);
			}
			for(var i=0, len=linfo.length; i < len; ++i)
			{
				var rec = linfo[i];
				var rec_len = rec.length;
				if(rec_len < maxcols)
				{
					for(var j=rec_len; j < maxcols; ++j)
					{
						rec.push("");
					}
				}
			}
			evaLayout = linfo;
			//console.log(linfo);
		} else { //assume an array
			evaLayout = layoutInfo;		
		}

		isPrecalculated = false;
	};
	
	this.getComponentRect = function(compWinHandle, rect)
	{
		rect.left = Math.random(5, 380);
		rect.top = Math.random(5, 380);
		rect.right = Math.random(rect.left + 6, 360);
		rect.bottom = rect.top + 20;
	};
	
	this.addComponent = function (componentName, compWinHandle, theParams)
	{
		var rect = {};
		this.getComponentRect (compWinHandle, rect, theParams);

		// add the component to the arrayand index it 
		componentArrayIdx[componentName] = componentArray.length;
		componentArray.push (new EvaWidgetInfo(componentName, compWinHandle, rect, theParams));
		isPrecalculated = false;
	};
	
	this.hideShowComponentsInLayout = function()
	{
		var compIds = this.getLayoutWidgetIds();
		for(var i=0, len=componentArray.length; i < len; ++i)
		{
			var wi = componentArray[i];
			this.hideShowComponent(wi.widgetId, !compIds[wi.widgetId]);
		}
	};
	
	this.hideShowComponent = function(theId, bHide)
	{
	};
	
	this.removeComponents = function ()
	{
		componentArray.length = 0;
		componentArrayIdx = {};
		isPrecalculated = false;
	};
	
	this.showComponent = function (cId, bShowHide)
	{
		console.log("show", cId, bShowHide);
	};
	
	this.moveComponent = function (cId, x, y, dx, dy, bShowHide)
	{
		console.log("move", cId, x, y, dx, dy, bShowHide);
	};
	
	var distributeWeight = function(aryExtraPos, aryReparto, HVdim, totalReparto, nrcsize)
	{
		for (var ii = 0, len=aryExtraPos.length; ii < len; ii ++) aryExtraPos[ii] = 0;
		var arsize = aryReparto.length;
		var totalWeight = 0;
		for (var ii = 0; ii < arsize; ii ++) totalWeight += aryReparto[ii][1];
		var repartHV = totalReparto / ((totalWeight === 0) ? 1 : totalWeight);
		for (var ii = 0; ii < arsize; ii ++)
		{
			var colAry = aryReparto[ii];
			var indx = colAry[0];
			var indxExpandHV = repartHV * colAry[1];
			HVdim[indx] = indxExpandHV;
			for (var res = indx+1; res < nrcsize; res ++)
			{
				aryExtraPos[res] += indxExpandHV;
			}
		}		
	};
	
	this.doLayout = function (totWidth, totHeight)
	{
		precalculateAll ();

		// repartir H
		distributeWeight(HextraPos, columnsReparto, Hdim, (totWidth  - fijoH), this.nColumns());

		// repartir V
		distributeWeight(VextraPos, rowsReparto, Vdim, (totHeight - fijoV), this.nRows());

		for (var ii = 0, len = componentArray.length; ii < len; ii ++)
		{
			var wi = componentArray[ii];

			this.showComponent (wi.widgetId, (wi.isLaidOut) ? true : false);
			if (! wi.isLaidOut) continue;

			var indxPos = wi.indxPos;
			var indxPosLeft = indxPos.left;
			var indxPosTop = indxPos.top;
			var indxPosRight = indxPos.right;
			var indxPosBottom = indxPos.bottom;
			var x = Hpos[indxPosLeft] + HextraPos[indxPosLeft];
			var y = Vpos[indxPosTop]  + VextraPos[indxPosTop];
			var dx = 0;
			var dy = 0;
			var mm;
			for (mm = indxPosLeft; mm <= indxPosRight; mm ++)
			{
				if (mm !== indxPosLeft) dx += Hgap;
				dx += Hdim[mm];
			}
			for (mm = indxPosTop; mm <= indxPosBottom; mm ++)
			{
				if (mm !== indxPosTop) dy += Vgap;
				dy += Vdim[mm];
			}

			//here we have a problem when the number become negative
			//the widget is not managed
			if (x < 0 || y < 0 || dx < 0 || dy < 0) //continue;
			{
				var elmRect = {};
				var elm = this.getComponentRect(wi.widgetId, elmRect);
				if(x < 0) x = elmRect.left;
				if(dx < 0) dx = elmRect.right - elmRect.left;
				if(y < 0) y = elmRect.top;
				if(dy < 0) dy = elmRect.bottom - elmRect.top;
			}

			this.moveComponent (wi.widgetId, x, y, dx, dy, true);
			//InvalidateRect(hControl, NULL, TRUE);
		}
	};
	
	this.getWidgets = function (vecNames)
	{
		var ncsize = nColumns();
		for (var rr = 0, rlen = this.nRows(); rr < rlen; rr ++)
		{
			for (var cc = 0; cc < ncsize; cc ++)
			{
				var name = this.widgetAt (rr, cc);
				if (name.length > 0 && name !== EXPAND_HORIZONTAL && name !== EXPAND_VERTICAL)
				{
					vecNames.push (name);
				}
			}
		}
	};
	
	this.nColumns = function()
	{
		return Math.max (0, evaLayout[1].length - 1);
	};
	
	this.nRows = function()
	{
		return Math.max (0, evaLayout.length - 2);
	};
	
	this.widgetAt = function(nrow, ncol)
	{
		var theRow = nrow+2;
		if(evaLayout.length > theRow)
		{
			var theCol = ncol + 1;
			theRow = evaLayout[theRow];
			if(theRow.length > theCol)
			{
				return theRow[theCol];
			}
		}
		return null;
	};
	
	this.getLayoutWidgetIds = function()
	{
		var widgetIds = {};
		var ncols = this.nColumns();
		for(var row=0, rlen=this.nRows(); row<rlen; ++row)
		{
			for(var col=0; col < ncols; ++col)
			{
				var wi = this.widgetAt(row, col);
				var found = widgetIds[wi.widgetId];
				widgetIds[wi.widgetId] = found ? found+1 : 1;
			}
		}
		return widgetIds;
	};
	
	//private
	
	var isExpandWeight = function(headStr, aryToStore, idxToStore)
	{
		if (headStr.indexOf(HEADER_EXPAND) === 0)
		{
			var weight = 1;
			if(headStr.length > 1)
			{
				weight = parseInt(headStr.substr(1));
			}
			aryToStore.push ([idxToStore, weight]);   // compute later
			return true;
		}
		return false;
	};
	
	var computeVHDim = function(nrcsize, getHeader, VHmargin, VHgap, VHdim, 
			VHpos, VHextraPos, aryReparto, getMinOf)
	{
		var fijoHV = VHmargin;
		for (var rr = 0; rr < nrcsize; rr ++)
		{
			var heaStr = getHeader(rr);
			var gap = (rr === 0) ? 0 : VHgap;

			VHdim.push (0);
			VHpos.push (0);
			VHextraPos.push (0);

			if (!isExpandWeight(heaStr, aryReparto, rr))
			{
				if (heaStr === "" || heaStr === HEADER_ADAPT)
				{
					VHdim[rr] = getMinOf(rr);   // maximum-minimum of the row
				}
				else
				{
					VHdim[rr] = parseInt(heaStr); // indicated size
				}
			}

			VHpos[rr] = fijoHV + gap;
			fijoHV += VHdim[rr];
			fijoHV += gap;
		}
		return fijoHV + VHmargin;
	};
	
	var precalculateAll = function  ()
	{
		if (isPrecalculated) return;

		var el_row = evaLayout[0];
		Hmargin = Math.max(0, parseInt(el_row[1]) );
		Vmargin = Math.max(0, parseInt(el_row[2]) );
		Hgap    = Math.max(0, parseInt(el_row[3]) );
		Vgap    = Math.max(0, parseInt(el_row[4]) );

		Hdim.length = 0;
		Hpos.length = 0;
		Vdim.length = 0;
		Vpos.length = 0;
		columnsReparto.length = 0;
		rowsReparto.length = 0;

		for (var ii = 0, len = componentArray.length; ii < len; ii ++)
		{
			componentArray[ii].isLaidOut = false;
		}

		//var cc;
		//var rr;
		var nrsize = self.nRows();
		var ncsize = self.nColumns();

		// compute Vdim
		fijoV = computeVHDim(nrsize, rowHeader, Vmargin, Vgap, Vdim, 
			Vpos, VextraPos, rowsReparto, minHeightOfRow);

		// compute Hdim
		fijoH = computeVHDim(ncsize, columnHeader, Hmargin, Hgap, Hdim, 
			Hpos, HextraPos, columnsReparto, minWidthOfColumn);

		// finding all components in the layout array
		for (var cc = 0; cc < ncsize; cc ++)
		{
			for (var rr = 0; rr < nrsize; rr ++)
			{
				var name = self.widgetAt(rr, cc);

				var indx = indxComponent (name);
				if (indx === -1) continue;

				var wid = componentArray[indx];
				var indxPos = wid.indxPos;

				// set position x,y
				indxPos.left = cc;
				indxPos.top  = rr;

				// set position x2,y2
				var ava = cc;
				while (ava+1 < ncsize && self.widgetAt(rr, ava+1) === EXPAND_HORIZONTAL) ava ++;
				indxPos.right = ava;

				ava = rr;
				while (ava+1 < nrsize && self.widgetAt(ava+1, cc) === EXPAND_VERTICAL) ava ++;
				indxPos.bottom = ava;

				wid.isLaidOut = true;
		      }
		}

		isPrecalculated = true;
	};
	
	var columnHeader = function (ncol)
	{
		return evaLayout[1][ncol + 1];
	};
	
	var rowHeader = function(nrow)
	{
		return evaLayout[2 + nrow][0];
	};
	
	var minHeightOfRow = function(nrow)
	{
		// el componente mas alto de la columna
		var maxheight = 0;
		for (var cc = 0, len = self.nColumns(); cc < len; cc ++)
		{
			var name = self.widgetAt (nrow, cc);
			var indx = indxComponent (name);
			if (indx === -1) continue;

			// if the widget occupies more than one row do not compute it
			if (self.widgetAt (nrow+1, cc) === EXPAND_VERTICAL) continue;

			var wid = componentArray[indx];
			var height = wid.iniRect.bottom - wid.iniRect.top;
			maxheight = Math.max (maxheight, height);
		}
		return maxheight;
	};
	
	var minWidthOfColumn = function(ncol)
	{
		// el componente mas ancho de la columna
		var maxwidth = 0;
		for (var rr = 0, len = self.nRows(); rr < len; rr ++)
		{
			var name = self.widgetAt (rr, ncol);
			var indx = indxComponent (name);
			if (indx === -1) continue;

			// if the widget occupies more than one column do not compute it
			if (self.widgetAt (rr, ncol+1) === EXPAND_HORIZONTAL) continue;

			var wid = componentArray[indx];
			var width = wid.iniRect.right - wid.iniRect.left;
			maxwidth = Math.max (maxwidth, width);
		}
		return maxwidth;
	};
	
	var indxComponent = function(compName)
	{
		var idx = componentArrayIdx[compName];
		return (idx >= 0) ? idx : -1;
	};
}

function MyEvaLayoutManager() {
	this.showComponent = function(cId, bShowHide)
	{
		//print("show", cId, bShowHide);
	};
	var mround = Math.round;
	this.moveComponent = function(cId, x, y, dx, dy, bShowHide)
	{
		//console.log(cId, x, y, dx, dy, bShowHide);
		var style = "position:absolute;left:" + mround(x) 
			+ "px;top:" + mround(y) 
			+ "px;width:" + mround(dx) 
			+ "px;height:" + mround(dy) + "px;\"";
		document.getElementById(cId).setAttribute("style", style);
	};
	
	this.getComponentRect = function(theId, rect)
	{
		var elm = document.getElementById(theId);
		if(elm)
		{
			rect.left = elm.offsetLeft;
			rect.top = elm.offsetTop;
			rect.right = elm.offsetLeft + elm.offsetWidth;
			rect.bottom = elm.offsetTop + elm.offsetHeight;			
		}
	};

	this.hideShowComponent = function(theId, bHide)
	{
		var elm = document.getElementById(theId);
		if(elm)
		{
			elm.style.display = bHide ? "none" : "";
		}		
	};
}

MyEvaLayoutManager.prototype = new EvaLayoutManager();
//MyEvaLayoutManager.prototype.constructor = MyEvaLayoutManager;
