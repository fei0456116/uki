include('list.js');

uki.view.table = {};

uki.view.declare('uki.view.Table', uki.view.Container, function(Base) {
    var propertiesToDelegate = 'rowHeight data packSize visibleRectExt render selectedIndex focusable textSelectable multiselect'.split(' ');
    
    this._rowHeight = 17;
    this._headerHeight = 17;
    this.defaultCss = Base.defaultCss + 'overflow:hidden;';
    this._listImpl = 'uki.view.List';
    
    uki.each(propertiesToDelegate, function(i, name) { uki.delegateProp(this, name, '_list'); }, this);
    
    this.columns = uki.newProp('_columns', function(c) {
        this._columns = uki.build(c);
        this._totalWidth = 0;
        for (var i = 0; i < this._columns.length; i++) {
            this._columns[i].position(i);
            this._columns[i].bind('beforeResize', uki.proxy(function() {
                this._updateTotalWidth();
                this._scrollPane.layout();
            }, this));
        };
        this._updateTotalWidth();
        this._header.columns(this._columns);
    });
    
    this._updateTotalWidth = function() {
        this._totalWidth = 0;
        for (var i=0; i < this._columns.length; i++) {
            this._columns[i].position(i);
            this._totalWidth += this._columns[i].width();
        };
        this._list.minSize(new Size(this._totalWidth, 0));
        this._list.rect(new Rect(this._totalWidth, this._list.height()));
        this._header.minSize(new Size(this._totalWidth, 0));
    };
    
    this._createDom = function() {
        Base._createDom.call(this);
        var scrollPaneRect = new Rect(0, this._headerHeight, this.rect().width, this.rect().height - this._headerHeight),
            listRect = scrollPaneRect.clone().normalize(),
            headerRect = new Rect(0, 0, this.rect().width, this._headerHeight),
            listML = { view: this._listImpl, rect: listRect, anchors: 'left top bottom', render: new uki.view.table.Render(this), className: 'table-list' },
            paneML = { view: 'ScrollPane', rect: scrollPaneRect, anchors: 'left top right bottom', scrollableH: true, childViews: [listML], className: 'table-scroll-pane'},
            headerML = { view: 'table.Header', rect: headerRect, anchors: 'top left right', className: 'table-header' };
            
        uki.each(propertiesToDelegate, function(i, name) { 
            if (this['_' + name] !== undefined) listML[name] = this['_' + name];
        }, this);
        this._scrollPane = uki.build(paneML)[0];
        this._list = this._scrollPane.childViews()[0];
        this._header = uki.build(headerML)[0];
        this._scrollPane.resizeToContents();
        this.appendChild(this._header);
        this.appendChild(this._scrollPane);
        
        this._scrollPane.bind('scroll', uki.proxy(function() {
            // this is kinda wrong but faster than calling rect() + layout()
            this._header.dom().style.left = -this._scrollPane.scrollLeft() + 'px'; 
        }, this));
        
    };
});

uki.Collection.addAttrs(['columns']);

include('table/render.js');
include('table/column.js');
include('table/header.js');
