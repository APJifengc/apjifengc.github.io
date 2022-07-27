JXG.Options.text.anchorX = "middle"
JXG.Options.text.fontSize = 20
JXG.Options.point.color = "#4953ff"
JXG.Options.line.strokeColor = "#000000"

function node(x, y, text, color) {
    let point = board.create("point", [x, y], {
        size: 30,
        name: "",
        showInfobox: false,
        color: color
    })
    let text1 = board.create("text", [
        () => point.X() , () => point.Y() , text], {
    });
    return {point: point, text: text1};
}
function edge(a, b, text, hasArrow, color) {
    let line = board.create("segment", [a.point, b.point], {
        lastArrow: hasArrow,
        touchLastPoint: true,
        strokeColor: color
    });
    let text2 = board.create("text", [
        () => {
            let k = -1 / (line.point1.Y() - line.point2.Y()) * (line.point1.X() - line.point2.X())
            if (isFinite(k)) {
                return (line.point1.X() + line.point2.X()) / 2 + Math.sqrt(0.1 / (k * k + 1))
            } else {
                return (line.point1.X() + line.point2.X()) / 2
            }
        },
        () => {
            let k = -1 / (line.point1.Y() - line.point2.Y()) * (line.point1.X() - line.point2.X())
            let b = (line.point1.Y() + line.point2.Y()) / 2 - (line.point1.X() + line.point2.X()) / 2 * k
            if (isFinite(k)) {
                return k * ((line.point1.X() + line.point2.X()) / 2 + Math.sqrt(0.1 / (k * k + 1))) + b
            } else {
                return line.point1.Y() + 0.316
            }
        } , text], {
    });
    return {line: line, text: text2};
}
function Reset(board, div) {
    div.style.width = "500px"
    div.style.height = "500px"
    for (let a in board.nodes) {
        if (board.nodes[a] == null) continue;
        board.removeObject(board.nodes[a].point, false)
        board.removeObject(board.nodes[a].text, false)
    }
    for (let a in board.edges) {
        if (board.edges[a] == null) continue;
        board.removeObject(board.edges[a].line, false)
        board.removeObject(board.edges[a].text, false)
    }
    board.nodes = {};
    board.edges = {};
}
function Load(content, board, div) {
    Reset(board, div)
    let value = JSON.parse(content);
    div.style.width = value.width
    div.style.height = value.height
    for (let a in value.nodes) {
        board.nodes[value.nodes[a].text] = (node(
            value.nodes[a].x,
            value.nodes[a].y,
            value.nodes[a].text,
            value.nodes[a].color
        ));
    }
    for (let a in value.edges) {
        board.edges[[value.edges[a].p1, value.edges[a].p2]] = (edge(
            board.nodes[value.edges[a].p1],
            board.nodes[value.edges[a].p2],
            value.edges[a].text,
            value.edges[a].hasArrow,
            value.edges[a].color
        ));
    }
}