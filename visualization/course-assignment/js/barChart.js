/*
 * 编写该大作业时尚未系统学习过javascript，源码写得不好请见谅
 */

// 定义svg边距规范
var margin = { top: 30, right: 70, bottom: 0, left: 100 },
    width = 520 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;

// 定义比例尺
var x = d3.scaleLinear()
    .range([0, width]);

var y = d3.scaleBand()
    .rangeRound([0, height - 1])
    .paddingInner(0.2)
    .paddingOuter(0);

// 定义坐标轴
var xAxis = d3.axisTop()
    .scale(x)
    .ticks(5);

var yAxis = d3.axisLeft()
    .scale(y);

// 使用插值函数定义颜色实现渐变
// var bar_color = d3.interpolate(d3.rgb(160, 220, 280), d3.rgb(60, 80, 150));

// 更新矩形框的函数声明
var selectBar;
var unselectBar;


// ———————————— 开始添加元素 ———————————— //

var body = d3.select("body");

// 清除浮动
// body.append("div")
//     .attr("class", "clear_fix");

// 定义ChartSVG
var chart = body.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// —————————— 读取城市数据 —————————— //
d3.csv("data/my_city_data.csv", function (data) {
    // 设置x、y定义域
    x.domain([0, d3.max(data, function (element) {
        return parseFloat(element.sales);
    })]);

    y.domain(data.map(function (element) {
        return element.city;
    }));

    // 定义渐变作用域的线性转换函数
    var colorLinear = d3.scaleLinear()
        .domain([
            d3.min(data, function (d) { return parseFloat(d.profit); }),
            d3.max(data, function (d) { return parseFloat(d.profit); })
        ])
        .range([0, 1]);

    // 调用x轴
    chart.append("g")
        .transition()
        .duration(500)
        // 在g元素上利用call函数调用xAxis
        .call(xAxis)
        .attr("class", "x_axis");

    // 添加x轴对应刻度的y轴方向竖线
    chart.selectAll(".tick").append("line")
        .transition()
        .duration(500)
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", 0)
        .attr("y2", height)
        .attr("opacity", "0.25");

    // 添加y轴坐标名称City
    chart.append("text")
        .attr("dx", -20)
        .attr("dy", 0)
        .attr("font-size", "16px")
        .attr("text-anchor", "end")
        .style("font-weight", "bold")
        .text("CITY")

    // 添加x轴坐标名称Sales
    chart.append("text")
        .attr("dx", width + 16)
        .attr("dy", 0)
        .attr("font-size", "16px")
        .style("font-weight", "bold")
        .text("SALES")

    // 向图表中添加矩形框组
    var barGroup = chart.append("g")
        .attr("class", "bar");

    // 向矩形框组中添加矩形框
    barGroup.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "rect unselected")
        .attr("id", function (d) {
            return d.city;
        })
        .style("fill", function (d) {
            d.color = color(colorLinear(d.profit));
            return d.color;
        })
        .attr("x", 0)
        .attr("y", function (d) { return y(d.city) })
        .attr("height", y.bandwidth())
        // 为了达到不同长度的柱子动画时间长度不同，需要使用each函数获得每一个data的sales
        .each(function (d) {
            d3.select(this)
                .transition()
                .duration(x(d.sales) * 3)
                .attr("width", function () { return x(d.sales) })
        })


    // 调用y轴
    chart.append("g")
        .transition()
        .duration(500)
        .call(yAxis)
        .attr("class", "y_axis");

    // 添加矩形框的交互效果
    barGroup.selectAll("rect")
        .on("mouseover", function () {
            d3.select(this)
                .style("cursor", "pointer")
                .attr("class", "rect selected")
        })
        .on("mouseout", function () {
            d3.select(this)
                .filter(function (d) {
                    return d.selected != true;
                })
                .attr("class", "rect unselected")
        })
        .on("click", function (d) {
            if (d.selected != true) {
                d.selected = true;
                dyeingBar();
                updateBarText();
                selectCircle(d.city);
            } else {
                d.selected = false;
                dyeingBar();
                updateBarText();
                unselectCircle(d.city);
            }
        });


    // ———————— 对于map选择操作后进行对于的bar响应 ———————— //

    // 染色函数
    var dyeingBar = function () {
        // 没选中的都变成灰色
        barGroup.selectAll("rect")
            .filter(function (d) {
                return d.selected != true;
            })
            .transition()
            .duration(200)
            .style("fill", "#ccc")

        // 用于判断是否全部未选择的状态变量
        var isAll = false;

        // 已经被选中的就都染色
        barGroup.selectAll("rect")
            .filter(function (d) {
                if (d.selected == true) {
                    // 存在被选择了的元素
                    isAll = true;
                    return true;
                } else {
                    return false;
                }
            })
            .transition()
            .duration(200)
            .style("fill", function (d) {
                return d.color;
            })

        // 如果全部都没有选中，则全部染色
        if (isAll == false) {
            barGroup.selectAll("rect")
                .transition()
                .duration(200)
                .style("fill", function (d) {
                    return d.color;
                })
        }
    }

    // 更新bar的销售额标签
    var updateBarText = function () {
        // 先清空所有标签
        barGroup.selectAll("text")
            .remove()

        // 再增加被选中的城市的销售额文字标签
        barGroup.selectAll("rect")
            .each(function (d) {
                if (d.selected == true) {
                    barGroup.append("text")
                    .attr("dx", x(d.sales) + 4)
                        .attr("dy", y(d.city) + y.bandwidth() / 2 + 5)
                        .attr("font-size", "14px")
                        .style("font-weight", "bold")
                        // 动画 实现每次选择后 标签闪烁一次
                        .style("fill", "#4af")
                        .transition()
                        .duration(200)
                        .style("fill", "#26a")
                        // 四舍五入
                        .text(parseInt(d.sales * 100 + 0.5) / 100)
                }
            })
    }

    // 选择矩形框函数
    selectBar = function (city) {
        barGroup.selectAll("rect")
            .filter(function (d) {
                // return d3.select(this).attr('id') == city;
                return d.city == city;
            })
            .each(function (d) {
                d.selected = true;
            })
            .attr("class", "rect selected")
        dyeingBar();
        updateBarText();
    }

    // 取消选择矩形框函数
    unselectBar = function (city) {
        barGroup.selectAll("rect")
            .filter(function (d) {
                return d.city == city;
            })
            .each(function (d) {
                d.selected = false;
            })
            .attr("class", "rect unselected")
        dyeingBar();
        updateBarText();
    }
});
