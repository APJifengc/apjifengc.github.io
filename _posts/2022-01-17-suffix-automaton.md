---
layout: post
title: 「学习笔记」后缀自动机与广义后缀自动机
date: 2022-01-17
tags: 学习笔记  字符串  后缀自动机  广义后缀自动机
---
**本文仅为方便理解，没有具体证明过程，推荐理解主要原理后去阅读详细证明过程。**  
**后缀自动机** 是一个处理字符串子串相关问题的优秀的算法。

## 引入

首先来考虑这样一个问题：如何存储一个字符串的所有子串？

一种方法是直接使用 $\mathrm{Trie}$ 树进行储存。

比如字符串 $abab$：

```graph
{"width":"555px","height":"732px","nodes":[{"text":"0","x":-0.05952399117606027,"y":4.17462482946794,"color":"#EEEEEE"},{"text":"a","x":-2.297619138445173,"y":2.1646201431669936,"color":"blue"},{"text":"ab","x":-2.309524263654436,"y":-0.30013642564802184,"color":"blue"},{"text":"aba","x":-2.3690474373953685,"y":-2.4010914051841747,"color":"blue"},{"text":"abab","x":-2.3809522901262556,"y":-4.365620736698499,"color":"blue"},{"text":"b","x":1.8571434020996094,"y":2.055480041087568,"color":"blue"},{"text":"ba","x":1.8456678255491126,"y":-0.23639629614470575,"color":"blue"},{"text":"bab","x":1.8333331516810827,"y":-2.4556624970689804,"color":"blue"}],"edges":[{"text":"a","p1":"0","p2":"a","color":"#000000","hasArrow":true},{"text":"b","p1":"a","p2":"ab","color":"#000000","hasArrow":true},{"text":"a","p1":"ab","p2":"aba","color":"#000000","hasArrow":true},{"text":"b","p1":"aba","p2":"abab","color":"#000000","hasArrow":true},{"text":"b","p1":"0","p2":"b","color":"#000000","hasArrow":true},{"text":"a","p1":"b","p2":"ba","color":"#000000","hasArrow":true},{"text":"b","p1":"ba","p2":"bab","color":"#000000","hasArrow":true}]}
```

这样显然可以存储下所有信息， 但是有一个问题， **这样的复杂度是 $O(n^2)$ 的**。

我们来观察这个 $\mathrm{Trie}$ 树：

```graph
{"width":"555px","height":"732px","nodes":[{"text":"0","x":-0.05952399117606027,"y":4.17462482946794,"color":"#EEEEEE"},{"text":"a","x":-2.297619138445173,"y":2.1646201431669936,"color":"blue"},{"text":"ab","x":-2.309524263654436,"y":-0.30013642564802184,"color":"blue"},{"text":"aba","x":-2.3690474373953685,"y":-2.4010914051841747,"color":"blue"},{"text":"abab","x":-2.3809522901262556,"y":-4.365620736698499,"color":"blue"},{"text":"b","x":1.8571434020996094,"y":2.055480041087568,"color":"blue"},{"text":"ba","x":1.8456678255491126,"y":-0.23639629614470575,"color":"blue"},{"text":"bab","x":1.8333331516810827,"y":-2.4556624970689804,"color":"blue"}],"edges":[{"text":"a","p1":"0","p2":"a","color":"#000000","hasArrow":true},{"text":"b","p1":"a","p2":"ab","color":"red","hasArrow":true},{"text":"a","p1":"ab","p2":"aba","color":"red","hasArrow":true},{"text":"b","p1":"aba","p2":"abab","color":"red","hasArrow":true},{"text":"b","p1":"0","p2":"b","color":"green","hasArrow":true},{"text":"a","p1":"b","p2":"ba","color":"green","hasArrow":true},{"text":"b","p1":"ba","p2":"bab","color":"green","hasArrow":true}]}
```

我们发现， 红色路径和绿色路径是完全一样的。

那么我们可不可以将它们合并起来？

```graph
{"width":"555px","height":"732px","nodes":[{"text":"0","x":1.0095452611817666,"y":4.1655172918596115,"color":"#EEEEEE"},{"text":"a","x":-2.297619138445173,"y":2.1646201431669936,"color":"blue"},{"text":"ab","x":-2.309524263654436,"y":-0.30013642564802184,"color":"blue"},{"text":"aba","x":-2.3690474373953685,"y":-2.4010914051841747,"color":"blue"},{"text":"abab","x":-2.3809522901262556,"y":-4.365620736698499,"color":"blue"}],"edges":[{"text":"a","p1":"0","p2":"a","color":"#000000","hasArrow":true},{"text":"b","p1":"a","p2":"ab","color":"red","hasArrow":true},{"text":"a","p1":"ab","p2":"aba","color":"red","hasArrow":true},{"text":"b","p1":"aba","p2":"abab","color":"red","hasArrow":true},{"text":"b","p1":"0","p2":"ab","color":"green","hasArrow":true}]}
```

**这时候节点上的子串就没有意义了，这里所代表的每一个子串是从根节点到一个节点的路径所组成的字符串。**

这样， 我们就把 8 个节点的 $\mathrm{Trie}$ 树压缩到了 5 个节点。

回到**后缀自动机**。

> ### 什么是自动机？
> *此处仅为简单理解， 并非严格定义*  
> 自动机，简单来说，就是一个**有向无环图**。  
> 对于一个字符串， 我们把它往自动机上跑， 也就是每次走**对应字母的边**， 直到走完所有的字符为止。
> 比如 AC 自动机， 我们一直跑， 如果有对应的字母的边， 说明匹配上了， 如果匹配不上怎么办？ 这时候就是**失配**了， 我们要跳**失配指针**跳到一个能够继续匹配的状态， 在 AC 自动机中， 就是当前匹配的字符串的一个后缀。
> 后缀自动机中的**失配指针**也是类似的， 一般叫做**后缀链接 $link$**， 为了方便类比记忆， 本文使用 $fail$ 来代表后缀链接 $link$。

我们思考这样一个问题：

在第一个图中， 我们在每个节点上标上了它相对应的字符串。

那么到了压缩后的图后， 这个字符串现在代表什么？

我们将 $a$ 和 $ab$ 压缩到了一起， 将 $ba$ 和 $aba$ 压缩到了一起， 将 $bab$ 和 $abab$ 压缩到了一起。

为什么这样压缩呢？

来看原字符串：

<!--<pre>
abab
a<span style="color:red">b</span>a<span style="color:green">b</span>
<span style="color:red">ab</span><span style="color:green">ab</span>
</pre>-->

```jxg
let normal = {fontSize: 50}
let red = {fontSize: 50, color: "red", highlightStrokeColor: "red"}
let green = {fontSize: 50, color: "green", highlightStrokeColor: "green"}
board.create("text", [-3, 3, "abab"], {fontSize: 50, name: "t1"})
board.create("text", ["X(t1)", "Y(t1) - 0.9", "ab    "], red)
board.create("text", ["X(t1)", "Y(t1) - 0.9", "    ab"], green)
board.create("text", ["X(t1)", "Y(t1) - 1.8", "a      "], normal)
board.create("text", ["X(t1)", "Y(t1) - 1.8", "    a  "], normal)
board.create("text", ["X(t1)", "Y(t1) - 1.8", "  b    "], red)
board.create("text", ["X(t1)", "Y(t1) - 1.8", "      b"], green)
board.create("text", [0, 3, "abab"], {fontSize: 50, name: "t2"})
board.create("text", ["X(t2)", "Y(t2) - 0.9", "  ba  "], red)
board.create("text", ["X(t2)", "Y(t2) - 0.9", "a    b"], normal)
board.create("text", ["X(t2)", "Y(t2) - 1.8", "aba  "], red)
board.create("text", ["X(t2)", "Y(t2) - 1.8", "      b"], normal)
board.create("text", [3, 3, "abab"], {fontSize: 50, name: "t3"})
board.create("text", ["X(t3)", "Y(t3) - 0.9", "  bab"], red)
board.create("text", ["X(t3)", "Y(t3) - 0.9", "a      "], normal)
board.create("text", ["X(t3)", "Y(t3) - 1.8", "abab"], red)
```

发现了什么？

被压缩的字符串，他们**在原字符串中出现的位置**是相同的。

我们将这个在原字符串中出现的位置称作 $endpos$ 集合。

例如， $ab$ 的 $endpos$ 集合为 $\\{2,4\\}$， $b$ 的 $endpos$ 也是 $\\{2,4\\}$。

我们把上面的每个 $endpos$ 相同的字符串的 $endpos$ 集合写出来：

```jxg
box.style.width = "700px"
let normal = {fontSize: 50}
let red = {fontSize: 50, color: "red", highlightStrokeColor: "red"}
let green = {fontSize: 50, color: "green", highlightStrokeColor: "green"}
board.create("text", [-3, 3, "abab"], {fontSize: 50, name: "t1"})
board.create("text", ["X(t1)", "Y(t1) - 0.9", "ab    "], red)
board.create("text", ["X(t1)", "Y(t1) - 0.9", "    ab"], green)
board.create("text", ["X(t1)", "Y(t1) - 1.8", "a      "], normal)
board.create("text", ["X(t1)", "Y(t1) - 1.8", "    a  "], normal)
board.create("text", ["X(t1)", "Y(t1) - 1.8", "  b    "], red)
board.create("text", ["X(t1)", "Y(t1) - 1.8", "      b"], green)
board.create("text", ["X(t1)", "Y(t1) - 2.7", "{2,4}"], normal)
board.create("text", [-1, 3, "abab"], {fontSize: 50, name: "t2"})
board.create("text", ["X(t2)", "Y(t2) - 0.9", "  ba  "], red)
board.create("text", ["X(t2)", "Y(t2) - 0.9", "a    b"], normal)
board.create("text", ["X(t2)", "Y(t2) - 1.8", "aba  "], red)
board.create("text", ["X(t2)", "Y(t2) - 1.8", "      b"], normal)
board.create("text", ["X(t2)", "Y(t2) - 2.7", "{3}"], normal)
board.create("text", [1, 3, "abab"], {fontSize: 50, name: "t3"})
board.create("text", ["X(t3)", "Y(t3) - 0.9", "  bab"], red)
board.create("text", ["X(t3)", "Y(t3) - 0.9", "a      "], normal)
board.create("text", ["X(t3)", "Y(t3) - 1.8", "abab"], red)
board.create("text", ["X(t3)", "Y(t3) - 2.7", "{4}"], normal)
board.create("text", [3, 3, "abab"], {fontSize: 50, name: "t5"})
board.create("text", ["X(t5)", "Y(t5) - 0.9", "a  a  "], red)
board.create("text", ["X(t5)", "Y(t5) - 0.9", "  b  b"], normal)
board.create("text", ["X(t5)", "Y(t5) - 2.7", "{1,3}"], normal)
```

看这些 $endpos$ 集合， 发现什么？

**他们之间只有无交集与被包含的关系。**

也就是说，这些 $endpos$ 集合就组成了一个**树形结构**。

我们不妨把他建出来：

```graph
{"width":"500px","height":"500px","nodes":[{"text":"{1ꓹ2ꓹ3ꓹ4}","x":-0.2266668701171875,"y":3.6933332824707032,"color":"#EEEEEE"},{"text":"{1ꓹ3}","x":-2.4266668701171876,"y":0.3866665649414063,"color":"#BBBBBB"},{"text":"{2ꓹ4}","x":1.72,"y":0.49333343505859373,"color":"#BBBBBB"},{"text":"{3}","x":-1.2533334350585938,"y":-2.8400006103515625,"color":"#999999"},{"text":"{4}","x":2.7866668701171875,"y":-2.84,"color":"#999999"}],"edges":[{"text":"","p1":"{1ꓹ2ꓹ3ꓹ4}","p2":"{1ꓹ3}","color":"#000000","hasArrow":false},{"text":"","p1":"{1ꓹ3}","p2":"{3}","color":"#000000","hasArrow":false},{"text":"","p1":"{2ꓹ4}","p2":"{4}","color":"#000000","hasArrow":false},{"text":"","p1":"{1ꓹ2ꓹ3ꓹ4}","p2":"{2ꓹ4}","color":"#000000","hasArrow":false}]}
```

那么为什么会出现这种情况呢？

我们来思考一下什么时候 $endpos$ 集合会减小：

比如像 $aabaabab$， $ab$ 的 $endpos$ 集合为 $\\{3,6,8\\}$。
但是如果再往它的前面加一个字母 $a$， 那么他的 $endpos$ 集合就变为了 $\\{3, 6\\}$。而如果在前面加一个 $b$， 他的 $endpos$ 集合就是 $\\{8\\}$ 了。

于是不难想到， $endpos_A \subseteq endpos_B$， 一定要满足 $B$ 是 $A$ 的后缀。

此时我们发现， 这不就是自动机的失配指针吗？

当我们能匹配时， 就一直在当前字符串后面加字母（即走转移函数）， 如果走不了， 就将前面的一些字母删掉， 再继续匹配（即走失配指针）。

这在后缀自动机中叫做**后缀链接 $link$**， 本文为了与一系列自动机类比记忆， 在代码中会将其写作失配指针 $fail$。

那么这些后缀链接所组成的树， 我们把它叫做 $parent$ 树。

并且， 由上面加减字符的过程， 不难得出， $endpos$ 集合相同的字符串长度一定是一个连续的区间。

例如字符串 $abcdabcdcd$， $endpos$ 集合为 $\\{4,8,10\\}$ 的所有字符串为： $d$, $cd$， $endpos$ 集合为 $\\{4,8\\}$ 的所有字符串为： $bcd$, $abcd$。

我们把这些 $endpos$ 集合相同的字符串叫做**等价类**。 这些等价类的长度有一个最大值， 有一个最小值。 我们把最大值记为 $len_i$, 那么它的最小值就是 $len_{link[i]} + 1$。因为一个等价类的后缀链接就是 $endpos$ 集合比他大的一个等价类， 这个等价类一定是更长的， 因为他是由原来的等价类在前面加字符得到的。 由此就可以理解， 等价类长度最小值就是他后缀链接的等价类的最大值加一。

转移函数我们用 $t_{i,c}$ 来表示， 即 $i$ 节点走字符为 $c$ 的边， 和 $\mathrm{Trie}$ 树的定义类似。

于是到此， 后缀自动机的大致定义就讲完了。

附上 $abab$ 的后缀自动机图：

```
咕咕咕
Graph Editor 还没写完 画不了虚线和曲线 回头再补
```

## 构建后缀自动机

说这么多， 如何构建？

后缀自动机是一个在线算法， 也就是一个一个字符的插入。

考虑插入进一个新的字符会发生什么：实际上就是添加了许多子串， 也就是目前添加的字符串的所有后缀再加一个新添加的字符组成的新的子串。

对于添加的最长的子串（即添加新字符后的字符串）， 他的 $endpos$ 一定就是当前添加字符的位置。 

对于其他的子串， 我们分几种情况来考虑：

1. **这个子串的等价类后面没有这一新字符的转移函数**  
   
   也就是说， 对于这个等价类来说， 往后面添加这个新的字符后， 在之前的字符串中不存在， 也就是他的 $endpos$ 和最长的子串是一样的， 都是只有一个当前添加字符的位置。   
   举个例子， $abab$ 后面如果加一个 $b$， 那么对于等价类 $b$, $ab$ 来说， 他们在后面添加字符 $b$ 后的等价类 $bb$, $abb$ 在原字符串中都不存在， 那么它的 $endpos$ 集合就只有一个 $\\{5\\}$。
2. **这个子串的等价类后面有这一新字符的转移函数**  
   
   那么就说明新的等价类在原字符串中出现过。此时我们还要再分两种情况：
   1. *新的等价类的最大长度等于原等价类长度+1*  
   2. *新的等价类的最大长度不等于原等价类长度+1*    

   为什么要这么分？

   因为一个等价类往后加一个字符不一定就仅仅加了一个字符。比如这个例子：

   $aaba$ 它有一个等价类 $aab$, $ab$, $b$。 那么我们往 $a$ 后面加一个 $b$ 会得到什么？ 会得到 $ab$。 但是 $ab$ 和 $aab$ 是等价的， 所以我们相当于得到了 $aab$。

   但是实际情况是， 往 $aaba$ 后加一个字符 $b$， 它变成了 $aabab$， 它得到的后缀为 $ab$， **但没有 $aab$**。 
   
   这是为什么呢？ 其实不难理解， 因为在原字符串中， $ab$ 和 $aab$ 都只出现了一次， 所以他们是等价的。 但是加了一个字符后， 又出现了一个 $ab$， 此时 $ab$ 和 $aab$ 就不等价了。 所以我们需要把原来的等价类分裂开。

   如果得到的等价类长度就等于原来的等价类长度+1， 那么说明这个等价类和往原来的等价类后加一个字符的等价类是完全一致的， 所以直接将它作为新的等价类即可。

上面是大致思想， 如果上面明白了， 那么下面的具体算法步骤就简单了。

我们首先要存储一下上一次添加字符的最后一个等价类 $last$， 即目前的字符串。 然后我们设一个指针 $p$， 初始值为 $last$。 然后新建出一个等价类 $np$ 作为加上字符后的最长字符串， 并把 $last$ 更新为 $np$。

```cpp
int p = last, np = last = ++tot;
```

对于新的字符串 $np$， 他的最大长度肯定是上一个字符串的最大长度+1。

```cpp
len[np] = len[p] + 1;
```

因为要枚举原来字符串的所有后缀， 这其实就是不断走后向链接（因为后向链接某种意义上就是这个等价类的后缀）。 

仔细思考， 发现上面第一处分情况实际上是单调的， 即前面肯定有一段是不存在转移函数， 而后面都存在这一转移函数。 因为跳后向链接还可以理解为删除字符串开头的字符， 当删除一定字符后， 后面一定是可以继续拓展的， 继续删除字符得到的字符串一定也是原来字符串的子串， 所以一定也是可以拓展的。

那么对于这些不存在转移函数的节点， 他们一定都转移到 $endpos$ 集合为新添加字符位置的等价类， 即最长的等价类 $np$。

```cpp
while (p && !t[p][c]) t[p][c] = np, p = fail[p];
// c 为添加的字符，根节点为 1, p = 0 就说明跳出了根节点。
```

一种情况是我们跳出了根节点， 说明所有后缀加上这个字符都是新的等价类， 那么新的等价类就不存在一个比他小的等价类， 那么就直接让他的后向链接指向根节点 1。

```cpp
if (!p) fail[np] = 1;
```

没有跳出根节点， 那么就说明我们遇到了第一个有转移函数的节点。 此时我们将转移函数的等价类记为 $q$。

```cpp
else {
    q = t[p][c];
```

如果 $q$ 的最大长度等于 $p$ 的最大长度+1， 那么说明 $q$ 就是我们需要的等价类。 同时， $q$ 是第一个 $endpos$ 不是唯一一个数的等价类， 所以它就是 $np$ 的后缀链接。

```cpp
    if (len[q] == len[p] + 1) fail[np] = q;
```

否则， 就要将 $q$ 分裂开。 我们新建一个等价类 $nq$ 作为分裂出来的等价类。 既然是分裂出来的， $nq$ 的转移函数和后向链接都是和 $q$ 一样的， 复制过来即可。 $nq$ 是 $p$ 加一个字符得到的， 所以他的最大长度就是 $len_p+1$。

```cpp
    else {
        int nq = ++tot;
        memcpy(t[nq], t[q], sizeof t[q]);
        fail[nq] = fail[q], len[nq] = len[p] + 1;
```

那么此时 $q$ 少了一个最小的字符串， 那么它的后向指针就应该指向这个最小的字符串， 即分裂出来的等价类 $nq$。 和第一种情况同一个道理， $np$ 的后向链接也是 $nq$。

```cpp
        fail[q] = fail[np] = nq;
```

此时对于上面还有很多等价类指向 $q$， 不断跳后向链接然后把它改成 $nq$ 就可以了。

```cpp
        while (p && t[p][c] == q) t[p][c] = nq, p = fail[p];
    }
}
```

结束了！完整代码：

```cpp
struct SAM {
    int t[MAXN][26], fail[MAXN], len[MAXN];
    int last, tot;
    SAM() : last(1), tot(1) {}
    void insert(int c) {
        int p = last, np = last = ++tot;
        len[np] = len[p] + 1;
        while (p && !t[p][c]) t[p][c] = np, p = fail[p];
        if (!p) fail[np] = 1;
        else {
            int q = t[p][c];
            if (len[q] == len[p] + 1) fail[np] = q;
            else {
                int nq = ++tot;
                memcpy(t[nq], t[q], sizeof t[q]);
                len[nq] = len[p] + 1, fail[nq] = fail[q], fail[np] = fail[q] = nq;
                while (p && t[p][c] == q) t[p][c] = nq, p = fail[p];
            } 
        }
    }
}sam;
```

## 用途
### 查询是否存在子串

直接把字模式串放到后缀自动机上跑即可。 不断跳对应的转移函数， 如果不存在就说明模式串不是原字符串的子串。

### 本质不同的字符串个数

首先后缀自动机上存储的等价类没有重复， 即本质不同。  
然后每个等价类里字符串的数量就是 $len_i - len_{link[i]}$。  
所以本质不同的字符串个数就是

$$
\sum_{i=1}^{tot}len_i-len_{link[i]}
$$

还有一种方法， 就是记录每一个本质不同的字符串的第一次出现。 也就是每插入一个字符时， 看新添加了多少本质不同的子串， 再统计。 每次新添加的本质不同的子串实际上也是 $len_i - len_{link[i]}$， 但是由于会存在分裂操作， 所以点数变多了， 但所有的 $len_i - len_{link[i]}$ 是不变的。

### 求子串出现次数 / 求 $endpos$ 集合的大小

我们可以先把 $parent$ 树建出来， 然后从下往上合并， 就可以求出每个 $endpos$ 集合的大小了。 对于每次添加新字符产生的等价类， 把它的初始值设置为 $1$， 因为它的 $endpos$ 就为新字符的位置。

实际上也可以以 $len$ 为关键字进行计数排序， 然后按照 $len$ 从大到小的顺序累计答案， 即让 $cnt_{link[i]} += cnt_i$， 因为在 $parent$ 树上， 深度就代表 $len$。

### 求两个字符串的最长公共子串

可以对第一个字符串建立后缀自动机， 然后将第二个字符串在后缀自动机上跑。 如果能拓展就拓展， 并将长度+1；否则就不断跳后向链接， 直到可以继续拓展， 并将长度设为拓展前的等价类的最大长度+1。（因为是在这个等价类的基础上往后拓展了一个字符）

这样可以求出在每一个位置所能匹配上的最长长度， 取 $\max$ 即可。

## 广义后缀自动机

~~（我只看懂了在线做法，就讲在线做法了，在线做法和普通后缀自动机差不多，写起来方便）~~

后缀自动机是对一个字符串建立的， 那如果是多个字符串呢？

有三种办法：
1. 中间隔一个没出现过的字符再建立普通后缀自动机
2. 每次将 $last$ 值设为 $1$ 再继续插入字符串
3. 先建立 $\mathrm{Trie}$ 树， 再进行一通操作（？）

前两种都是伪广义后缀自动机， ~~我搜了半天已经看懵了，跑了~~

显然广义后缀自动机应该是第三种（

但是操作太神奇， 我也没看懂， 所以讲一种在线的做法（貌似和第二种差不多？）

如果每次将 $last$ 值设为 $1$ 再继续插入字符串的话， 那么会有一个问题：

在插入一个字符串时， 每一次 $last$ 对应的转移函数一定是不存在的。

而现在因为是多个字符串， 所以有可能 $t_{last,c}$ 是存在的。

所以我们要来特判一下 $t_{last,c}$ 存在的情况：

1. **如果 $len[t_{last,c}]=len[last]+1$**  
   
   那么说明我们要添加的字符已经存在了， 直接将 $last$ 设为 $t_{last,c}$ 即可。

2. **如果 $len[t_{last,c}]\ne len[last]+1$**
   
   此处和第二处分情况讨论是一样的， 我们需要将 $t_{last,c}$ 分裂开， 代码是完全一样的， 只不过少了关于 $np$ 的操作， 因为我们没有新建 $np$。

   那么 $last$ 此时应该是 $nq$。 因为我们就是在 $last$ 的基础上加了一个字符， 而 $nq$ 就是分裂出来的只加一个字符的等价类。

~~（这就完了， 在线做法属实好理解）~~

代码：

```cpp
struct GSA {
    int t[MAXN][26], fail[MAXN], len[MAXN];
    int tot;
    GSA() : tot(1) {}
    int insert(int c, int last) {
        if (t[last][c]) {
            int p = last, q = t[p][c];
            if (len[t[last][c]] == len[last] + 1) return q;
            else {
                int nq = ++tot;
                len[nq] = len[p] + 1, fail[nq] = fail[q], fail[q] = nq;
                memcpy(t[nq], t[q], sizeof t[q]);
                while (p && t[p][c] == q) t[p][c] = nq, p = fail[p];
                return nq;
            }
        }
        int p = last, np = ++tot;
        len[np] = len[p] + 1;
        while (p && !t[p][c]) t[p][c] = np, p = fail[p];
        if (!p) fail[np] = 1;
        else {
            int q = t[p][c];
            if (len[q] == len[p] + 1) fail[np] = q;
            else {
                int nq = ++tot;
                memcpy(t[nq], t[q], sizeof t[q]);
                fail[nq] = fail[q], len[nq] = len[p] + 1;
                fail[q] = fail[np] = nq;
                while (p && t[p][c] == q) t[p][c] = nq, p = fail[p];
            }
        }
        return np;
    }
}gsa;
```

## 用途

### 求多个字符串中本质不同的子串个数

和普通的后缀自动机是一样的。

建立广义后缀自动机， 然后计算 $len_i - len_{link[i]}$ 的和即可。

### 求多个字符串的最长公共子串

我们将广义后缀自动机建立出来， 并且记录下每个等价类都是由哪一个字符串建立的。

然后按照 $len$ 降序， 将每个等价类的信息合并到他的后缀链接上（因为如果这个等价类在某个字符串中存在， 那么它的后缀链接肯定也在某个字符串中存在）。

最后按照 $len$ 从大到小， 看这个子串是否在所有的字符串中都出现过， 如果是， 那么它的 $len$ 就是所有字符串的最长公共子串。

~~好久没写过这种长文了，累得慌~~