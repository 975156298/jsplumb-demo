let jsplumbPackage = {
    common: {
        maxConnections: -1,
        connector: ['Flowchart'], // Bezier: 贝塞尔曲线  Flowchart: 具有90度转折点的流程线  StateMachine: 状态机  Straight: 直线
        endpointStyle: {fill: "#456"}, // 端点样式
        connectorStyle: {
            stroke: "#456",  // 连线样式
            strokeWidth: 3
            // 'stroke-dasharray': '5,5' // 用于创建虚线
        }
    },
    defaultParams: {
        connection: {},
        connections: [],
        dom: [],
        parentId: 'right', // 父节点，整个放置部分
        child: '.item',  // 子节点，放置的元素
        color: ['#456', 'red', 'blue'], // 线的颜色
        height: [400, 600],
        startMaxNum: 2,
        startNum: 0
    },
    addEndPoint (id, anchor, common) {
        let connection = jsPlumb.addEndpoint(id, {
            anchor: anchor,
            connectorOverlays: [["PlainArrow", {width: 10, length: 30, location: 1}]]
        }, common)
        return connection
    },
    addEndPoints (id, point = [], common) {
        common = {
            isSource: true,
            isTarget: true,
            // endpoint: ['Image', {src: './icon_close.png'}], 用于换图片
            ...common
        }
        for (let i = 0; i < point.length; i++) {
            this.defaultParams.connection[id] = this.addEndPoint(id, point[i], common)
            this.bindClick(this.defaultParams.connection[id])
        }
    },
    // id 拖动元素id
    setDragg (id) {
        jsPlumb.draggable(id, {containment: 'parent'})
        $('#' + id).draggable({containment: "parent"})
    },
    bindClick (dom) {
        dom.bind('click', function (event) {
            console.log(event, '点击')
            console.log(event.anchor.type, event.elementId)
            console.log($(event.canvas).addClass('abc'))
        })
    },
// 用于移入显示、移出隐藏事情
    globalMove () {
        $('#' + this.defaultParams.parentId).on('mouseenter', this.defaultParams.child, function () {
            console.log('11111', $(this).attr('id'))
            let doms = jsPlumb.selectEndpoints({source: $(this).attr('id')})
            doms.each(function (item) {
                $(item.canvas).addClass('jtk-hover')
            })
            $(this).find('.close').removeClass('hide')
        })
        $('#' + this.defaultParams.parentId).on('mouseleave', this.defaultParams.child, function () {
            let doms = jsPlumb.selectEndpoints({source: $(this).attr('id')})
            doms.each(function (item) {
                $(item.canvas).removeClass('jtk-hover')
            })
            $(this).find('.close').addClass('hide')
        })
    },
// 用于jsplumb 绑定全局事情 connection =》 代表连接事情 beforeDrop =》 连接之前作出判断是否可连接，fase不连接、true连接
    jsPlumbBind () {
        // let _this = this
        jsPlumb.bind('connection', function (info) {
            // console.log(info)
        })
        jsPlumb.bind('beforeDrop', function (info) {
            console.log(info)
            if (info.sourceId === info.targetId) {
                alert('不许连接')
                return false
            }
            return true
        })
        jsPlumb.bind('click', function (coon, originalEvent) {
            console.log(coon)
            // this.detach(coon)
            console.log(jsPlumb)
            jsPlumb.deleteConnection(coon)
        })
    },
    globalBind () {
        let _this = this
        _this.jsPlumbBind()
        _this.globalMove()
        $('#' + this.defaultParams.parentId).on('click', '.close', function () {
            _this.removeDom(this)
        })
    },
    createDom (ui, event, id, state = 'a') {
        let html = $('#' + id).clone()
        let newId = id + '-' + state + '-' + new Date().getTime()
        $(html).attr('id', newId)
        if (id === 'start') {
            let getDoms = $('#' + this.defaultParams.parentId + ' > div')
            this.defaultParams.startNum = 0
            let _this = this
            $.each(getDoms, function (index, item) {
                let id = $(item).attr('id')
                if (id) {
                    if (id.split('-')[0] === 'start') {
                        _this.defaultParams.startNum++
                    }
                }
            })
            console.log(this.defaultParams.startNum)
            $(html).css({
                top: this.defaultParams.height[this.defaultParams.startNum - 1] + 'px',
                left: '20px',
                display: 'flex'
            })
        } else {
            $(html).css({
                top: ui.position.top - $(event).offset().top,
                left: ui.position.left - $(event).offset().left,
                display: 'flex'
            })
        }
        $('#' + this.defaultParams.parentId).append(html)
        return newId
    },
    setLineColor (common, state = 0) {
        let newCommon = this.deepClone(common)
        newCommon.endpointStyle.fill = this.defaultParams.color[state]
        newCommon.connectorStyle.stroke = this.defaultParams.color[state]
        return newCommon
    },
    deepClone (data) {
        let str = JSON.stringify(data)
        return JSON.parse(str)
    },
    removeDom (_this) {
        let id = $(_this).parent().attr('id')
        console.log(id)
        // jsPlumb.deleteConnectionsForElement(id) // 断开连接, 只会断开线，不会删除元素 deleteEndpoint
        jsPlumb.remove(id) // 会删除元素和线，但是官方说有bug。
    },
    getColorState (id) {
        let state = id.split('-')[1]
        let states = ['a', 'b', 'c']
        return states.indexOf(state)
    },
    // 保存数据
    saveJsplumb () {
        console.log('111111111111111111', jsPlumb.getConnections())
        this.defaultParams.dom = []
        this.defaultParams.connections = []
        let dom = this.defaultParams.dom
        let connections = this.defaultParams.connections
        let getDoms = $('#' + this.defaultParams.parentId + ' > div')
        let _this = this
        $.each(getDoms, function (index, item) {
            let id = $(item).attr('id')
            if (id) {
                dom.push({
                    id: id,
                    node: $('#' + id)
                })
            }
        })
        $.each(jsPlumb.getConnections(), function (idx, connection) {
            console.log(idx, 'idx============')
            console.log(connection)
            connections.push({
                state: _this.getColorState(connection.sourceId),
                connectionId: connection.id,
                pageSourceId: connection.sourceId,
                pageTargetId: connection.targetId,
                anchors: $.map(connection.endpoints, function (endpoint) {
                    return [[endpoint.anchor.x,
                        endpoint.anchor.y,
                        endpoint.anchor.orientation[0],
                        endpoint.anchor.orientation[1],
                        endpoint.anchor.offsets[0],
                        endpoint.anchor.offsets[1]]];

                })
            })
        })
        $('#' + this.defaultParams.parentId + ' > ' + this.defaultParams.child).each(function () {
            jsPlumb.remove($(this).attr('id'))
        })
        console.log(this.defaultParams.dom, this.defaultParams.connections)
    },
    loadJsplumb () {
        this.addDom()
        let _this = this
        $.each(this.defaultParams.connections, function (index, elem) {
            console.log(elem)
            jsPlumb.connect({
                source: elem.pageSourceId,
                target: elem.pageTargetId,
                anchors: elem.anchors,
                // detachable: false,
                ..._this.dataCommon(elem.state)
            })
        })
    },
    addDom () {
        let dom = this.defaultParams.dom
        for (let i = 0; i < dom.length; i++) {
            $('#' + this.defaultParams.parentId).append(dom[i].node)
            // this.addEndPoints(dom[i].id, ['TopCenter', 'RightMiddle', 'BottomCenter', 'LeftMiddle'], this.setLineColor(this.common, i))
            this.addEndPoints(dom[i].id, ['LeftMiddle'], this.setLineColor(this.common, this.getColorState(dom[i].id)))
            this.setDragg(dom[i].id)
        }
        this.init()
    },
    dataCommon (state = 0) {
        console.log(state)
        return {
            isSource: true,
            isTarget: true,
            connector: ['Flowchart'], // Bezier: 贝塞尔曲线  Flowchart: 具有90度转折点的流程线  StateMachine: 状态机  Straight: 直线
            paintStyle: {stroke: this.defaultParams.color[state], strokeWidth: 3},
            // endpointStyle: { fill: this.defaultParams.color[state]}, // 点的颜色
            overlays: [["PlainArrow", {width: 10, length: 30, location: 1}]]
        }
    },
    init () {
        this.setDrag('left')
        this.setDrop(this.defaultParams.parentId)
        this.globalBind()
    },
    setDrag (id, scope = 'scope') {
        $("#" + id).children().draggable({
            helper: "clone",
            scope: scope // scope 标识符，任何值都可以。
        })
    },
    setDrop (id, scope = 'scope') {
        let _this = this
        $('#' + id).droppable({
            scope: scope,
            drop: function (event, ui) {
                console.log(event, ui)
                let newId
                let name = ui.draggable[0].id
                switch (name) {
                    case 'yellowingPersonnelNode':
                        newId = _this.createDom(ui, this, 'yellowingPersonnel', 'a')
                        _this.addEndPoints(newId, ['TopCenter', 'RightMiddle', 'BottomCenter', 'LeftMiddle'], _this.common)
                        _this.setDragg(newId)
                        break;
                    case 'yellowishHotelNode':
                        newId = _this.createDom(ui, this, 'yellowishHotel', 'b')
                        _this.addEndPoints(newId, ['TopCenter', 'RightMiddle', 'BottomCenter', 'LeftMiddle'], _this.setLineColor(_this.common, 1))
                        // _this.addEndPoints(newId, [['Left', 'Continuous']], _this.setLineColor(_this.common, 1))
                        _this.setDragg(newId)
                        break;
                    case 'realPopulationNode':
                        newId = _this.createDom(ui, this, 'realPopulation', 'c')
                        _this.addEndPoints(newId, ['TopCenter', 'RightMiddle', 'BottomCenter', 'LeftMiddle'], _this.setLineColor(_this.common, 2))
                        _this.setDragg(newId)
                        break;
                }
            }
        })
    }
}