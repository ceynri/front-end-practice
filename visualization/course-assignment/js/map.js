// SVG的宽度和高度
var w = 660;
var h = 520;

// 默认颜色
var defaulted_color = "rgb(200,230,250)";

// 地图的投影
var projection = d3.geoAlbersUsa()
    .translate([w / 2, h / 2])
    .scale([820]);

// 路径生成器
var path = d3.geoPath()
    .projection(projection);

// 颜色数组
var colorArray = [
    "rgb(253, 183, 95)",
    "rgb(153, 201, 226)",
    "rgb(148, 197, 225)",
    "rgb(126, 180, 215)",
    "rgb(126, 180, 215)",
    "rgb(105, 158, 201)",
    "rgb(105, 158, 201)",
    "rgb(89, 141, 187)",
    "rgb(89, 141, 187)",
    "rgb(73, 123, 170)",
    "rgb(73, 123, 170)",
    "rgb(54, 105, 155)",
    "rgb(54, 105, 155)",
    "rgb(43, 92, 138)",
    "rgb(43, 92, 138)"
]

// 量化比例尺
var color = d3.scaleQuantize()
    .range(colorArray)

// 响应调用函数声明
var selectCircle;
var unselectCircle;


// ———————— 开始往body添加元素 ———————— //

// 选择body
var body = d3.select("body");

// 清除浮动
body.append("div")
    .attr("class", "clear_fix");

// SVG元素
var map = body.append("svg")
    .attr("width", w)
    .attr("height", h)
    .attr("class", "map")

// 添加图例
var i = -1;
var width = 82.5;
var height = 10;
var y = h - height;
var legend = map.selectAll("rect")
    .data(colorArray)
    .enter()
    .append("rect")
    .attr("y", y)
    .attr("height", height)
    // 初始动画效果
    .style("fill", "gray")
    .transition()
    .duration(1500)
    .attr("width", width)
    .style("fill", function (d) {
        return d;
    })
    .attr("x", function () {
        i++;
        return i * width;
    })
// TODO 增加图例的交互，使其可以进行特定利润值的筛选

// 添加图例的数值标签
var i = -1;
var fontsSize = 9;
map.selectAll("rect")
    .each(function () {
        map.append("text")
            .attr("dx", function () {
                i++;
                return (i + 0.48) * width;
            })
            .attr("dy", y + fontsSize - 1)
            .attr("font-size", fontsSize)
            .attr("text-anchor", "middle")
            .text("undefined")
            .style("fill", "white")
    })



// ———————— 读入GeoJSON数据 —————————— //
d3.json("data/us-states.json", function (json) {

    // 显示州名
    var setStateText = function (d) {
        // 获得路径的边界，返回一个二维数组代表了四个顶点
        var bounds = path.bounds(d);
        // 取得该路径得中心点
        var dx = (bounds[0][0] + bounds[1][0]) / 2;
        var dy = (bounds[0][1] + bounds[1][1]) / 2;

        // 添加文字
        this.map.append("text")
            .attr("class", "name")
            .attr("dx", dx)
            .attr("dy", dy)
            .attr("font-size", "12px")
            .attr("text-anchor", "middle")
            .text(d.properties.name)
            // 取消该元素对于鼠标指针行为的影响
            // 由于该标签在地图之上，当鼠标位于该标签之上时，
            // 地图会认为鼠标不在地图上（被遮挡），造成文字消失
            .style("pointer-events", "none");

    }

    // 显示城市相关文段
    var setCityText = function (d) {
        var dx = projection([d.longitude, d.latitude])[0];
        var dy = projection([d.longitude, d.latitude])[1];

        // 添加城市名
        map.append("text")
            .attr("class", "name")
            .attr("dx", dx)
            .attr("dy", dy)
            .attr("font-size", "12px")
            .attr("text-anchor", "middle")
            .text(d.city)
            .style("pointer-events", "none");

        // 添加利润值
        map.append("text")
            .attr("class", "name")
            .attr("dx", dx)
            .attr("dy", dy + 14)
            .attr("font-size", "12px")
            .attr("text-anchor", "middle")
            // 四舍五入保留两位小数
            .text(parseInt(d.profit * 100 + 0.5) / 100)
            .style("pointer-events", "none");
    }

    // 删除显示的州名、城市
    var removeText = function () {
        map.selectAll(".name")
            .remove();
    }

    // ———————— 绘制地图 ———————— //
    map.selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("d", path)
        // 初始动画效果
        .attr("fill", "grey")
        .transition()
        .duration(1000)
        .attr("fill", defaulted_color)
        .style("stroke", "white")
        .style("stroke-width", 1)

    // 添加州的交互操作
    map.selectAll("path")
        .on("mouseover", function (d) {
            // 在匿名函数中，this指的是上下文的元素
            d3.select(this)
                .style("stroke", "gray")
                .transition()
                .duration(100)
                .style("opacity", 0.5);
            setStateText(d);
        })
        .on("mouseout", function () {
            d3.select(this)
                .style("stroke", "white")
                .transition()
                .duration(500)
                .style("fill", defaulted_color)
                .style("opacity", 1);
            removeText();
        });

    // ———————— 导入城市数据 ———————— //
    d3.csv("data/my_city_data.csv", function (data) {

        // 颜色比例尺的定义域
        var min = d3.min(data, function (d) { return parseFloat(d.profit); });
        var max = d3.max(data, function (d) { return parseFloat(d.profit); });
        color.domain([min, max]);

        // 添加图例的标签
        var i = -0.5;
        var para = (max - min) / 8 + min;
        map.selectAll("text")
            .each(function () {
                i++;
                d3.select(this)
                    .text(parseInt(para * i * 100 + 0.5) / 100)
            })

        // 添加城市圆圈
        map.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return projection([d.longitude, d.latitude])[0];
            })
            .attr("cy", function (d) {
                return projection([d.longitude, d.latitude])[1];
            })
            // 初始动画
            // 为了达到不同大小的圆圈动画时间长度不同，需要使用each函数获得每一个data的sales
            .each(function (d) {
                d3.select(this)
                    .transition()
                    .duration(d.sales / 400)
                    .attr("r", function () {
                        return Math.sqrt(parseFloat(d.sales) * 0.001);
                    })  
                    .style("fill", function () {
                        return color(d.profit);
                    })
                    .attr("class", "circle unselected")
            })

        //添加城市的交互操作
        map.selectAll("circle")
            .on("mouseover", function (d) {
                d3.select(this)
                    .style("cursor", "pointer")
                    .transition()
                    .duration(100)
                    .attr("r", function (d) {
                        return Math.sqrt(600 + parseFloat(d.sales) * 0.004);
                    });
                setCityText(d);
            })
            .on("mouseout", function () {
                d3.select(this)
                    .transition()
                    .duration(500)
                    .attr("r", function (d) {
                        return Math.sqrt(parseFloat(d.sales) * 0.001);
                    })
                removeText();
            })
            .on("click", function (d) {
                if (d.selected != true) {
                    d.selected = true;
                    d3.select(this)
                        .transition()
                        .duration(400)
                        .attr("class", "circle selected");
                    selectBar(d.city);
                } else {
                    d.selected = false;
                    d3.select(this)
                        .transition()
                        .duration(400)
                        .attr("class", "circle unselected");
                    unselectBar(d.city);
                }
            });



    });


    // ———————— 对于bar选择操作后进行对于的map响应 ———————— //

    // 响应选择的函数
    selectCircle = function (city) {
        map.selectAll("circle")
            .filter(function (d) {
                return d.city == city;
            })
            .each(function (d) {
                d.selected = true;
            })
            .attr("class", "circle selected")
    }
    // 取消选择的函数
    unselectCircle = function (city) {
        map.selectAll("circle")
            .filter(function (d) {
                return d.city == city;
            })
            .each(function (d) {
                d.selected = false;
            })
            .attr("class", "circle unselected")
    }
});
