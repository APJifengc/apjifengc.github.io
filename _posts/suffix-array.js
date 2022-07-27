function element(id) {
    return document.getElementById(id)
}
function onClick() {
    function createRow(type) {
        let tr = document.createElement("tr")
        for (let i = 1; i < arguments.length; i++) {
            let argument = arguments[i]
            let th = document.createElement("th")
            if (type[i - 1] === "L") th.style.textAlign = "left"
            if (type[i - 1] === "R") th.style.textAlign = "right"
            th.innerHTML = argument
            tr.appendChild(th)
        }
        return tr
    }
    const ch = " " + element("input").value
    const n = ch.length - 1
    let m = 300;
    const MaxN = 305
    let sa = Array(MaxN).fill(0),
        rnk = Array(MaxN).fill(0),
        tmp = Array(MaxN).fill(0),
        tp = Array(MaxN).fill(0),
        snd = Array(MaxN).fill(0),
        cnt = Array(MaxN).fill(0);
    function cmp(a, b, w) {
        return tp[a] === tp[b] && tp[a + w] === tp[b + w];
    }
    function info(value) {
        let li = document.createElement("li")
        li.innerHTML = value
        content.appendChild(li)
    }
    let content = element("content")
    function generateTable(type, highlightType, highlight) {
        let table = document.createElement("table")
        let thead = document.createElement("thead")
        let tbody = document.createElement("tbody")
        if (type === 1) thead.appendChild(createRow("MM", "编号", "前缀"))
        if (type === 2) thead.appendChild(createRow("MMM", "编号", "前缀", "排名"))
        if (type === 3) thead.appendChild(createRow("MMMM", "编号", "前缀", "排名", "第二关键字排名"))
        table.appendChild(thead)
        table.appendChild(tbody)
        content.appendChild(table)
        for (let i = 1; i <= n; i++) {
            let suffix
            if (highlightType === 0) suffix = ch.substring(sa[i]);
            if (highlightType === 1) suffix = `<span style="color:red">${ch.substring(sa[i], sa[i] + highlight)}</span>${ch.substring(sa[i] + highlight)}`
            if (highlightType === 2) suffix = `<span style="color:red">${ch.substring(sa[i], sa[i] + highlight)}</span><span style="color:green">${ch.substring(sa[i] + highlight, sa[i] + highlight * 2)}</span>${ch.substring(sa[i] + highlight * 2)}`
            if (type === 1) tbody.appendChild(createRow("ML", sa[i], suffix))
            if (type === 2) tbody.appendChild(createRow("MLM", sa[i], suffix, rnk[sa[i]]))
            if (type === 3) tbody.appendChild(createRow("MLMM", sa[i], suffix, rnk[sa[i]], snd[sa[i]]))
        }
    }
    content.innerHTML = ""
    for (let i = 1; i <= n; i++) sa[i] = i;
    generateTable(1, 0)
    for (let i = 1; i <= n; i++) cnt[rnk[i] = ch.charCodeAt(i)]++;
    for (let i = 1; i <= m; i++) cnt[i] += cnt[i - 1];
    for (let i = n; i >= 1; i--) {
        sa[cnt[rnk[i]]--] = i;
    }
    info("对第一个字符进行排序");
    generateTable(2, 1, 1)
    for (let w = 1, p = 0; ; w <<= 1, m = p, p = 0) {
        info("接下来处理长度为 " + w * 2 + " 的。 我们首先找出所有第一关键字和第二关键字：");
        for (let i = 1; i <= n; i++) snd[i] = rnk[i + w];
        generateTable(3, 2, w)
        for (let i = 1; i <= n; i++) tp[i] = sa[i];
        for (let i = 1; i <= m; i++) cnt[i] = 0;
        for (let i = 1; i <= n; i++) cnt[tmp[i] = rnk[tp[i] + w]]++;
        for (let i = 1; i <= m; i++) cnt[i] += cnt[i - 1];
        for (let i = n; i >= 1; i--) sa[cnt[tmp[i]]--] = tp[i];
        info("按照第二关键字排序：")
        generateTable(3, 2, w)
        for (let i = 1; i <= n; i++) tp[i] = sa[i];
        for (let i = 1; i <= m; i++) cnt[i] = 0;
        for (let i = 1; i <= n; i++) cnt[tmp[i] = rnk[tp[i]]]++;
        for (let i = 1; i <= m; i++) cnt[i] += cnt[i - 1];
        for (let i = n; i >= 1; i--) sa[cnt[tmp[i]]--] = tp[i];
        info("按照第一关键字排序：")
        generateTable(3, 2, w)
        let t = rnk; rnk = tp; tp = t;
        p = 0;
        // 这里 tp数组就没用了， 我们需要存上一轮的 rnk 数组， 所以直接swap就可以了。
        for (let i = 1; i <= n; i++) rnk[sa[i]] = cmp(sa[i], sa[i - 1], w) ? p : ++p;
        info("长度为 " + w * 2 + " 的子串就排序好了。 进行去重：")
        generateTable(2, 1, w * 2)
        if (p === n) { // 如果 rnk 互不相同， 直接结束排序。
            info("此时排名各不相同， 直接结束排序。")
            for (let i = 1; i <= n; i++) sa[rnk[i]] = i;
            generateTable(1, 0)
            break;
        }
    }
    // content.innerHTML += sa.toString()
}