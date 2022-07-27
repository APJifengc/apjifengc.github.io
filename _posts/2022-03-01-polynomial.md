---
layout: post
title: 「学习笔记」多项式
date: 2022-03-01
tags: 数学  多项式  FFT/快速傅里叶变换  NTT/快速数论变换
---

开个大坑。

# FFT 前的前置知识

## 复数

~~应该想学FFT的人都会复数吧~~

复数，即形如 $a+bi$ 的数，其中 $a,b$ 为实数，$i$ 为虚数单位（即 $
\sqrt{-1}$）。

在复平面上，一个复数代表着一个点。所谓复平面，即以实数为 $x$ 轴，以虚数为 $y$ 轴所构成的平面直角坐标系。

对于复数加减，直接将实部与虚部相加即可。对于复数乘法，$(a+bi)(c+di)=(ac-bd)+(ad+bc)i$。

在复平面上的复数乘法有这样一个口诀：**模相乘，幅角相加**。

模即在复平面上点到原点的距离，幅角即相对于 $x$ 轴正半轴所逆时针旋转的角度。

## 单位根

我们在复平面上做一个半径为 $1$ 的圆，并将他五等分。

```jxg
board.create("point", [0, 0], {
  name: "0",
  fixed: true
});
board.create("axis", ["0", [1, 0]]);
board.create("axis", ["0", [0, 1]]);
board.create("point", [function() {
  return Math.cos(2 * Math.PI / 5 * 0)
}, function() {
  return Math.sin(2 * Math.PI / 5 * 0)
}], {
  name: "ω_5^0"
});
board.create("point", [function() {
  return Math.cos(2 * Math.PI / 5 * 1)
}, function() {
  return Math.sin(2 * Math.PI / 5 * 1)
}], {
  name: "ω_5^1"
});
board.create("point", [function() {
  return Math.cos(2 * Math.PI / 5 * 2)
}, function() {
  return Math.sin(2 * Math.PI / 5 * 2)
}], {
  name: "ω_5^2"
});
board.create("point", [function() {
  return Math.cos(2 * Math.PI / 5 * 3)
}, function() {
  return Math.sin(2 * Math.PI / 5 * 3)
}], {
  name: "ω_5^3"
});
board.create("point", [function() {
  return Math.cos(2 * Math.PI / 5 * 4)
}, function() {
  return Math.sin(2 * Math.PI / 5 * 4)
}], {
  name: "ω_5^4"
});
board.create("circle", [
  [0, 0], 1
], {
  fixed: true
});
setTimeout(function() { board.setBoundingBox([-1.5, 1.5, 1.5, -1.5]) }, 100)
board.create("segment", ["ω_5^0","0"], {dash: true, color: "green"})
board.create("segment", ["ω_5^1","0"], {dash: true, color: "green"})
board.create("segment", ["ω_5^2","0"], {dash: true, color: "green"})
board.create("segment", ["ω_5^3","0"], {dash: true, color: "green"})
board.create("segment", ["ω_5^4","0"], {dash: true, color: "green"})
```

这样，我们发现，这些点的模长都为 $1$，并且幅角都是若干倍的关系。

具体的，我们记 $n$ 等分的单位圆上，相对于 $x$ 轴正半轴逆时针旋转的第一个点，记做 $\omega_n$，也就是**单位根**。

根据**模相乘，幅角相加**，那么第二个点就是 $\omega_n^2$，最后一个点就是 $\omega_n^{n-1}$。并且，$\omega_n^n=1$。

单位根的一些性质：

1. $\omega_n^k=\omega_{2n}^{2k}$
   $\omega_n^k=\omega_{\frac{n}{2}}^{\frac{k}{2}}$
   这两个应该比较容易理解。四等分的第二份，相当于八等分的第四份，也相当于两等分的第一份。
2. $\omega_{2n}^{n+k}=-\omega_{2n}^{k}$
   因为 $\omega_{2n}^{n}=-1$，所以上式正确。

如何计算单位根？由于是将单位圆进行 $n$ 等分，所以直接使用三角函数计算即可。

即：

$$\omega_n=\cos\left(\frac{2\pi}{n}\right)+\sin\left(\frac{2\pi}{n}\right)i$$

C++ 中提供了复数类 `complex`，可以去网上搜索相关用法。不过也可以直接自己写一个，并不难写。

# 点值表示法

一般，我们所见的多项式的表示方式都是**系数表示法**，即直接给出 $x^i$ 的系数 $a^i$。而点值表示法，就是给出 $n+1$ 个点，来表示一个多项式。因为给出 $n+1$ 个点后，就可以唯一确定一个 $n$ 次的多项式，参考拉格朗日插值法。

对于多项式乘法来说，系数表示法不好计算，但是点值表示法就很容易计算，直接将相对应的数字相乘即可。所以，我们考虑将系数表示法转换为点值表示法。

# 离散傅里叶变换

**离散傅里叶变换**，即 **DFT**，是一种将系数表示法快速转换为点值表示法的变换。

对于一个 $n$ 次的多项式 $f(x)$：

$$f(x)=a_0+a_1x+a_2x^2+\cdots+a_nx^n$$

我们将它按照奇偶性分开：

$$f(x)=(a_0+a_2x^2+a_4x^4+\cdots)+(a_1x+a_3x^3+a_5x^5+\cdots)$$

我们分别再设两个多项式 $G(x)=a_0+a_2x+a_4x^2+\cdots$ 和 $H(x)=a_1+a_3x+a_5x^2+\cdots$，那么上式就可以表示为：

$$f(x)=G(x^2)+x\cdot H(x^2)$$

我们将 $x=\omega_n^k$ 代入：

$$\begin{aligned}
f(\omega_n^k)&=G((\omega_n^k)^2)+\omega_n^k\cdot H((\omega_n^k)^2)\\
&=G(\omega_n^{2k})+\omega_n^k\cdot H(\omega_n^{2k})\\
&=G(\omega_{\frac{n}{2}}^k)+\omega_n^k\cdot H(\omega_{\frac{n}{2}}^k)\\
\end{aligned}$$

同理：

$$\begin{aligned}
f(\omega_n^{k+\frac{n}{2}})&=G((\omega_n^{k+\frac{n}{2}})^2)+\omega_n^{k+\frac{n}{2}}\cdot H((\omega_n^{k+\frac{n}{2}})^2)\\
&=G((-\omega_n^k)^2)-\omega_n^k\cdot H((-\omega_n^k)^2)\\
&=G(\omega_n^{2k})-\omega_n^k\cdot H(\omega_n^{2k})\\
&=G(\omega_{\frac{n}{2}}^k)-\omega_n^k\cdot H(\omega_{\frac{n}{2}}^k)\\
\end{aligned}$$

那么我们发现，只要求出 $G(\omega_{\frac{n}{2}}^k)$ 和 $H(\omega_{\frac{n}{2}}^k)$ 后，我们就可以同时求出 $f(\omega_n^{k+\frac{n}{2}})$ 和 $f(\omega_n^k)$。因此，我们可以直接分治对它进行递归计算。

因为我们进行分治，为了保证左右区间长度相等（不然不好合并），我们可以提前将多项式补到 $2^m-1$ 次，再进行 DFT。

贴一段 [OI-Wiki](https://oi-wiki.org/math/poly/fft/#_8) 的代码（我没写过递归版本的）：

```cpp
#include <cmath>
#include <complex>

typedef std::complex<double> Comp;  // STL complex

const Comp I(0, 1);  // i
const int MAX_N = 1 << 20;

Comp tmp[MAX_N];

void DFT(Comp *f, int n, int rev) {  // rev=1,DFT; rev=-1,IDFT
  if (n == 1) return;
  for (int i = 0; i < n; ++i) tmp[i] = f[i];
  for (int i = 0; i < n; ++i) {  // 偶数放左边，奇数放右边
    if (i & 1)
      f[n / 2 + i / 2] = tmp[i];
    else
      f[i / 2] = tmp[i];
  }
  Comp *g = f, *h = f + n / 2;
  DFT(g, n / 2, rev), DFT(h, n / 2, rev);  // 递归 DFT
  Comp cur(1, 0), step(cos(2 * M_PI / n), sin(2 * M_PI * rev / n));
  // Comp step=exp(I*(2*M_PI/n*rev)); // 两个 step 定义是等价的
  for (int k = 0; k < n / 2; ++k) {
    tmp[k] = g[k] + cur * h[k];
    tmp[k + n / 2] = g[k] - cur * h[k];
    cur *= step;
  }
  for (int i = 0; i < n; ++i) f[i] = tmp[i];
}
```

时间复杂度是 $O(n\log n)$ 的。

但是这样常数会很大。中间我们不断的对系数进行了交换，我们可以考虑优化这一过程，来观察最后系数位置的变化：

我们将位置化为二进制，来模拟一下这个交换过程：

1. $\{000,001,010,011,100,101,110,111\}$
2. $\{000,010,100,110\}\{001,011,101,111\}$
3. $\{000,100\}\{010,110\}\{001,101\}\{011,111\}$
4. $\{000\}\{100\}\{010\}\{110\}\{001\}\{101\}\{011\}\{111\}$

发现：一个数最后的位置就是一开始的位置的二进制左右翻转。

其实再仔细观察下会发现，第 $i$ 次奇偶性分类其实就是将二进制位 $i$ 为 $0$ 的划分到一块，将 $1$ 划分到一块，原来是高位连续，现在变成了低位连续，于是就是将二进制左右翻转了。

于是，我们可以首先预处理出数组 $r$ 代表二进制位翻转过后的数字。

直接放代码：

```cpp
for (int i = 0; i < limit; i++)
    r[i] = (r[i >> 1] >> 1) | ((i & 1) * limit >> 1)
```

自己手模一下就可以，不难理解。

提前交换完毕后，我们发现：合并时，我们将 $k$ 与 $k + \frac{n}{2}$ 合并起来，还是合并到 $k$ 与 $k + \frac{n}{2}$ 这两个位置。所以，我们可以得到 **蝴蝶操作**：

```cpp
Complex x = a[k], y = w * a[k + n / 2];
a[k] = x + y, a[k + n / 2] = x - y;
```

（仅为示例，在实际代码中有所不同）

这样，我们就可以不用任何额外数组，就做到了合并一次答案。最后，我们还可以将递归舍去：直接枚举要合并的区间的长度和区间的位置进行合并。

放代码：

```cpp
void dft(int limit) {
    for (int i = 0; i < limit; i++) if (i < r[i]) swap(a[i], a[r[i]]);
    for (int mid = 1; mid < limit; mid <<= 1) { // 枚举区间长度
        Complex step(cos(PI / mid), sin(PI / mid)); // 单位根
        for (int l = 0, len = mid << 1; l < limit; l += len) { // 枚举区间左端点
            Complex cur(1, 0);
            for (int k = 0; k < mid; k++, cur = cur * step) { // 枚举 k
                Complex x = a[l + k], y = cur * a[l + k + mid];
                a[l + k] = x + y;
                a[l + k + mid] = x - y;
            }
        }
    }
}
```

# 逆离散傅里叶变换

**逆离散傅里叶变换**，即 **IDFT**，就是将点值表示法转回系数表示法的方法。

我们从线性代数的角度考虑上面的 DFT 操作，其实就是将系数向量乘上了一个矩阵，也就是：

$$\begin{bmatrix}y_0 \\ y_1 \\ y_2 \\ y_3 \\ \vdots \\ y_{n-1} \end{bmatrix} = \begin{bmatrix}1 & 1 & 1 & 1 & \cdots & 1 \\ 1 & \omega_n^1 & \omega_n^2 & \omega_n^3 & \cdots & \omega_n^{n-1} \\ 1 & \omega_n^2 & \omega_n^4 & \omega_n^6 & \cdots & \omega_n^{2(n-1)} \\ 1 & \omega_n^3 & \omega_n^6 & \omega_n^9 & \cdots & \omega_n^{3(n-1)} \\ \vdots & \vdots & \vdots & \vdots & \ddots & \vdots \\ 1 & \omega_n^{n-1} & \omega_n^{2(n-1)} & \omega_n^{3(n-1)} & \cdots & \omega_n^{(n-1)^2} \end{bmatrix} \begin{bmatrix} a_0 \\ a_1 \\ a_2 \\ a_3 \\ \vdots \\ a_{n-1} \end{bmatrix}$$

我们记左面的点值向量为 $E$，中间的矩阵为 $D$，右面的系数矩阵为 $V$，那么 $D\times V=E$。

我们求 $V$，实际上就是要求 $D$ 的逆矩阵。

考虑构造 $A_{ij}=D_{ij}^{-1}$，来计算 $A \times D$：

$$\begin{aligned}
(A\times D)_{ij}&=\sum_{k=0}^{n-1}A_{ik}D_{kj}\\
&=\sum_{k=0}^{n-1}\omega_n^{-ik}\omega_n^{kj}\\
&=\sum_{k=0}^{n-1}\omega_n^{k(j-i)}\\
&=\begin{cases}
n&(i=j)\\
\sum_{k=0}^{n-1}(\omega_n^{j-i})^k=\frac{(\omega_n^{j-i})^n-1}{\omega_n^{j-i}-1}=\frac{(\omega_n^n)^{j-i}-1}{\omega_n^{j-i}-1}=0 &(i\ne j)
\end{cases}
\end{aligned}$$

发现这个矩阵就是单位矩阵的 $n$ 倍。即 $\frac{A\times D}{n}=I$，那么 $D^{-1}=\frac{1}{n}A$。

这样，我们将点值向量左乘一个 $\frac{1}{n}A$，就得到了系数表示法。

具体实现上，由于 $A_{ij}=D_{ij}^{-1}=\omega_n^{-ij}=\omega_n^{n-ij}$，它与 $\omega_n^{ij}$ 在复平面上是关于 $x$ 轴对称的，所以直接对虚部取一个相反数即可。那么，我们将 DFT 函数中引入一个 `type` 参数，表示是否是逆操作，那么就可以写出下面的代码：

```cpp
void dft(int limit, int type) {
    for (int i = 0; i < limit; i++) if (i < r[i]) swap(a[i], a[r[i]]);
    for (int mid = 1; mid < limit; mid <<= 1) { // 枚举区间长度
        Complex step(cos(PI / mid), type * sin(PI / mid)); // 单位根
        for (int l = 0, len = mid << 1; l < limit; l += len) { // 枚举区间左端点
            Complex cur(1, 0);
            for (int k = 0; k < mid; k++, cur = cur * step) { // 枚举 k
                Complex x = a[l + k], y = cur * a[l + k + mid];
                a[l + k] = x + y;
                a[l + k + mid] = x - y;
            }
        }
    }
    if (type == -1) // 不要忘记 1/n
        for (int i = 0; i < limit; i++) a[i].r /= limit;
}
```

附封装版的完整代码：

```cpp
#include <bits/stdc++.h>
using namespace std;
const int MAXN = 60005;
struct Complex {
    double r, i;
    Complex(double r = 0, double i = 0) : r(r), i(i) {}
    Complex operator+(Complex b) { return { r + b.r, i + b.i }; }
    Complex operator-(Complex b) { return { r - b.r, i - b.i }; }
    Complex operator*(Complex b) { return { r * b.r - i * b.i, r * b.i + i * b.r }; }
};
int r[MAXN];
const double PI = acos(-1.0);
struct Polynomial {
    vector<Complex> a;
    int len;
    Complex& operator[](int b) { return a[b]; }
    Polynomial(int len = 0) : len(len) { a.resize(len + 1); }
    void set(int len) { this->len = len, a.resize(len + 1); }
    void dft(int limit, int type) {
        set(limit);
        for (int i = 0; i < limit; i++) 
            if (i < r[i]) swap(a[i], a[r[i]]);
        for (int mid = 1; mid < limit; mid <<= 1) {
            Complex step(cos(PI / mid), type * sin(PI / mid));
            for (int l = 0; l < limit; l += (mid << 1)) {
                Complex w(1, 0);
                for (int j = 0; j < mid; j++, w = w * step) {
                    Complex x = a[l + j], y = w * a[l + j + mid];
                    a[l + j] = x + y, a[l + j + mid] = x - y;
                }
            }
        }
        if (type == -1) for (int i = 0; i < limit; i++) a[i].r /= limit;
    }
    Polynomial operator*(Polynomial b) {
        Polynomial a = *this, c; 
        int n = len + b.len;
        int limit = 1; 
        while (limit <= n) limit <<= 1; 
        c.set(limit);
        for (int i = 0; i < limit; i++) 
            r[i] = (r[i >> 1] >> 1) | ((i & 1) * limit >> 1);
        a.dft(limit, 1), b.dft(limit, 1);
        for (int i = 0; i < limit; i++) c[i] = a[i] * b[i];
        c.dft(limit, -1);
        c.set(n);
        return c;
    }
};
```

# NTT 快速数论变换

FFT 有一个重要的问题：精度问题。毕竟涉及到浮点数运算，精度误差是不可避免的，而有时候我们需要求取模意义下的数，这时候普通的 FFT 就不适用了。这时候，我们就引出了 NTT。

精度的瓶颈在哪？显然是单位根的运算。我们考虑模意义下什么东西可以代替单位根。

——没错，就是**原根**。

不明白原根的建议自行百度，上一篇博客写到了原根，但是写的并不详细。

我们来一一看这几条性质：

1. $\omega_n^k$ 对于 $k\in [0,n-1]$ 互不相等。
   若模数 $p$ 为一个质数，那么对于原根 $g$，$g^k,k\in[0,p-1]$ 互不相等，那么 $(g^\frac{p-1}{n})^k,k\in[0,n-1]$ 也互不相等。
2. $\omega_n^k=\omega_{\frac{n}{2}}^{\frac{k}{2}}$
   $$(g^\frac{p-1}{n/2})^\frac{k}{2}=g^{\frac{p-1}{n/2}\times \frac{k}{2}}=(g^\frac{p-1}{n})^k$$
3. $\omega_{2n}^{k+n}=-\omega_{2n}^{k}$
   由费马小定理可得，$g^{p-1}\equiv 1$，那么 $g^{p-1} - 1 \equiv (g^{\frac{p-1}{2}} - 1)(g^{\frac{p-1}{2}} + 1) \equiv 0$，即 $g^{\frac{p-1}{2}} = \pm 1$。
   又因为 $g^0\equiv 1$，根据性质 1，$g^{\frac{p-1}{2}} = -1$，那么 $(g^{\frac{p-1}{2n}})^n \equiv g^{\frac{p-1}{2}} \equiv -1$，即 $(g^{\frac{p-1}{2n}})^{n + k} \equiv -(g^{\frac{p-1}{2n}})^k$。

于是，我们可以得出以下结论：原根就是模意义下的单位根！

不过我们发现，$n$ 是 $2^m$ 的形式，那么 $\frac{p-1}{n}$ 要想是整数，那么 $p$ 必须是 $r\times 2^t + 1$ 的形式。

实际上，有：

$$998244353=119\times 2^{23} + 1,g=3$$

另外一些常用的 NTT 模数：

$$469762049=7\times 2^{26} + 1,g=3$$
$$1004535809=479\times 2^{21} + 1,g=3$$

考场上如何检验一个数是不是 NTT 模数？

~~gnome-calculator 有个功能叫质因数分解~~

如果模数不是 NTT 模数怎么办？

~~那你就大骂出题人↓↑~~

[任意模数多项式乘法](https://www.luogu.com.cn/problem/solution/P4245)

NTT code:

```cpp
#include <bits/stdc++.h>
using namespace std;
const int MAXN = 3000005, P = 998244353, G = 3, GI = 332748118;
int qpow(int a, int b) {
    int ans = 1;
    while (b) {
        if (b & 1) ans = 1ll * ans * a % P;
        a = 1ll * a * a % P;
        b >>= 1;
    }
    return ans;
}
int r[MAXN];
struct Polynomial {
    vector<int> a;
    int len;
    int& operator[](int b) { return a[b]; }
    Polynomial(int len = 0) : len(len) { a.resize(len + 1); }
    void set(int b) { len = b, a.resize(b + 1); }
    void ntt(int limit, bool rev) {
        set(limit);
        for (int i = 0; i < limit; i++)
            if (i < r[i]) swap(a[i], a[r[i]]);
        for (int mid = 1; mid < limit; mid <<= 1) {
            int step = qpow(rev ? GI : G, (P - 1) / (mid << 1));
            for (int l = 0; l < limit; l += (mid << 1)) {
                int w = 1;
                for (int j = 0; j < mid; j++, w = 1ll * w * step % P) {
                    int x = a[l + j], y = 1ll * w * a[l + j + mid] % P;
                    a[l + j] = (x + y) % P, a[l + j + mid] = (1ll * P + x - y) % P;
                }
            }
        }
        if (rev) {
            int ninv = qpow(limit, P - 2);
            for (int i = 0; i < limit; i++) 
                a[i] = 1ll * a[i] * ninv % P;
        }
    }
    Polynomial operator*(Polynomial b) {
        Polynomial a = *this, c; int n = a.len + b.len;
        int limit = 1; while (limit <= n) limit <<= 1;
        c.set(limit);
        for (int i = 1; i < limit; i++)
            r[i] = (r[i >> 1] >> 1) | ((i & 1) * limit >> 1);
        a.ntt(limit, 0);
        b.ntt(limit, 0);
        for (int i = 0; i <= limit; i++) c[i] = 1ll * a[i] * b[i] % P;
        c.ntt(limit, 1);
        c.set(n);
        return c;
    }
};
```

# 应用

多项式乘法通常可以用于快速计算**卷积**。

观察多项式乘法的式子：

$$F\times G=\sum_{i=0}^{n}\sum_{j=0}^{m}f_ig_jx^{i+j}$$

我们可以转换一下：

$$F\times G=\sum_{i=0}^{n+m}\sum_{j=0}^{i}f_jg_{i-j}x^i$$

我们发现，$x^i$ 的系数为 $\sum_{j=0}^{n}f_jg_{i-j}$，也就是卷积的形式。

于是，我们可以将很多形如卷积形式的式子使用 FFT/NTT 进行优化。

例题：

[P3338 [ZJOI2014]力](https://www.luogu.com.cn/problem/P3338)

> 给出 $n$ 个数 $q_1,q_2, \dots q_n$​，定义
> $$F_j~=~\sum_{i = 1}^{j - 1} \frac{q_i \times q_j}{(i - j)^2}~-~\sum_{i = j + 1}^{n} \frac{q_i \times q_j}{(i - j)^2}$$
> $$E_i~=~\frac{F_i}{q_i}$$
> 对 $1 \leq i \leq n$，求 $E_i$​ 的值。

首先化式子：

$$\begin{aligned}
E_i&=\frac{F_i}{q_i}\\
&=\sum_{j = 1}^{i - 1} \frac{q_j}{(j - i)^2}-\sum_{j = i + 1}^{n} \frac{q_j}{(j - i)^2}\\
&=\sum_{j = 1}^{i - 1} \frac{q_j}{(i - j)^2}-\sum_{j = 1}^{n - i} \frac{q_{i + j}}{j^2}&(j \rightarrow j + i)\\
\end{aligned}$$

左面显然是卷积形式，设 $F(x)=q_x,G(x)=\frac{1}{x^2}$，那么左面的式子就是 $(F \cdot G)(i - 1)$。

那么看右面：右面是差一定的形式，而不是和一定。我们可以将 $F(x)$ 的下标翻转过来，即设 $F'(x)=F(n-x)$，那么右面就变为了 

$$\sum_{j = 1}^{n - i} F'(n - i - j)G(j)$$

发现这就也是卷积的形式了，直接计算即可。

[P4199 万径人踪灭](https://www.luogu.com.cn/problem/P4199)

见 [上篇文章](https://apjifengc.gitee.io/2022/03/01/P4199.html)。

# 全 家 桶 ！

实际上我就学了几个，为了防止过段时间全忘了，就先记一下。

## [多项式乘法逆](https://www.luogu.com.cn/problem/P4238)

给定多项式 $F(x)$，求一个多项式 $G(x)$ 使得 $F(x)G(x)\equiv 1\pmod {x^n}$。

考虑倍增。假如现在已经求出了 $F(x)H(x)\equiv 1\pmod {x^{\lceil\frac{n}{2}\rceil}}$：

$$\begin{aligned}
F(x)H(x)&\equiv 1&\pmod {x^{\lceil\frac{n}{2}\rceil}}\\
F(x)G(x)&\equiv 1&\pmod {x^{\lceil\frac{n}{2}\rceil}}\\
F(x)(G(x)-H(x))&\equiv 0&\pmod {x^{\lceil\frac{n}{2}\rceil}}\\
G(x)-H(x)&\equiv 0&\pmod {x^{\lceil\frac{n}{2}\rceil}}\\
(G(x)-H(x))^2&\equiv 0&\pmod {x^n}\\
G(x)^2-2G(x)H(x)+H(x)^2&\equiv 0&\pmod {x^n}\\
F(x)G(x)^2-2F(x)G(x)H(x)+F(x)H(x)^2&\equiv 0&\pmod {x^n}\\
G(x)-2H(x)+F(x)H(x)^2&\equiv 0&\pmod {x^n}\\
G(x)&\equiv 2H(x)-F(x)H(x)^2&\pmod {x^n}\\
\end{aligned}$$

$n=1$ 时，直接求逆元即可。

```cpp
Polynomial inv(int n) {
    Polynomial b;
    b[0] = qpow(a[0], P - 2);
    for (int d = 1; d < (n << 1); d <<= 1) {
        Polynomial a = *this;
        a.set(d - 1);
        int limit = d << 1;
        calcRev(limit);
        a.ntt(limit, 0), b.ntt(limit, 0);
        for (int i = 0; i < limit; i++) 
            b[i] = (2ll - 1ll * a[i] * b[i] % P + P) % P * b[i] % P;
        // 直接对点值进行计算，而不是两次多项式乘法，优化常数
        b.ntt(limit, 1);
        b.set(d - 1);
    }
    b.set(n - 1);
    return b;
}
```

## [多项式开根](https://www.luogu.com.cn/problem/P5205)

给定多项式 $F(x)$，求一个多项式 $G(x)$ 使得 $G(x)^2\equiv F(x)\pmod {x^n}$。

同样考虑倍增：假设已经求得 $H(x)^2\equiv F(x) \pmod {x^{\lceil\frac{n}{2}\rceil}}$，那么：

$$\begin{aligned}
H(x)^2&\equiv F(x) &\pmod {x^{\lceil\frac{n}{2}\rceil}}\\
G(x)^2&\equiv F(x) &\pmod {x^{\lceil\frac{n}{2}\rceil}}\\
H(x)^2&\equiv G(x)^2 &\pmod {x^{\lceil\frac{n}{2}\rceil}}\\
H(x)&\equiv G(x) &\pmod {x^{\lceil\frac{n}{2}\rceil}}\\
H(x) - G(x) &\equiv 0 &\pmod {x^{\lceil\frac{n}{2}\rceil}}\\
(H(x) - G(x))^2&\equiv 0 &\pmod {x^n}\\
H(x)^2 - 2H(x)G(x) + G(x)^2&\equiv 0 &\pmod {x^n}\\
H(x)^2 - 2H(x)G(x) + F(x)&\equiv 0 &\pmod {x^n}\\
G(x) &\equiv \frac{H(x)^2 + F(x)}{2H(x)} &\pmod {x^n}\\
\end{aligned}$$

求逆元，然后倍增算就可以了。

对于 $n=1$ 的情况，在强化版中，要计算二次剩余 $x^2\equiv a_0$，~~我不会，咕了。~~

```cpp
Polynomial sqrt(int n) {
    static int TWOINV = qpow(2, P - 2);
    Polynomial b;
    b[0] = 1;
    for (int d = 1; d < (n << 1); d <<= 1) {
        Polynomial a = *this, c = b.inv(d);
        a.set(d - 1);
        int limit = d << 1;
        calcRev(limit);
        a.ntt(limit, 0), c.ntt(limit, 0);
        for (int i = 0; i < limit; i++) a[i] = 1ll * a[i] * c[i] % P;
        a.ntt(limit, 1);
        b.set(d - 1);
        for (int i = 0; i < d; i++) b[i] = 1ll * (a[i] + b[i]) * TWOINV % P;
    }
    b.set(n - 1);
    return b;
}
```

## [多项式对数函数（多项式 $\ln$）](https://www.luogu.com.cn/problem/P4725)

给定多项式 $F(x)$，求一个多项式 $G(x)$ 使得 $G(x)\equiv \ln F(x)\pmod {x^n}$。

直接求不好求，我们给他求个导：

$$G'(x)\equiv\frac{F'(x)}{F(x)}\pmod {x^n}$$

再积分回去：

$$G(x)\equiv\int\frac{F'(x)}{F(x)}\pmod {x^n}$$

求导与积分：

```cpp
Polynomial derivative() {
    Polynomial b(len - 1);
    for (int i = 1; i <= len; i++) b[i - 1] = 1ll * a[i] * i % P;
    return b;
}
Polynomial integral() {
    Polynomial b(len + 1);
    for (int i = 0; i <= len; i++) b[i + 1] = 1ll * a[i] * qpow(i + 1, P - 2) % P;
    return b;
}
```

对数：

```cpp
Polynomial ln(int n) {
    return (derivative() * inv(n)).integral().set(n - 1);
}
```

## [多项式指数函数（多项式 $\exp$）](https://www.luogu.com.cn/problem/P4726)

需要用一个东西：

### 牛顿迭代：

什么是牛顿迭代？

牛顿迭代是用来求零点的方法。首先有一个近似值 $x_0$，做 $x_0$ 处的切线，交 $x$ 轴于一点，再以这点作为 $x_0$ 继续迭代。

贴一个互动图：

<div style="border: 1px solid; padding: 10px">
<table width="600" border="0" cellpadding="0" cellspacing="0">
x<sub>o</sub> is the start value. Drag it.
<p></p>
You may change the function term here:
<br>
<td><nobr>f(x) = </nobr></td>
<td>
<form>
<input style="border:none; background-color:#efefef;padding:5px;margin-left:2px;" type="text" id="graphterm" value="x*x*x/5" size="30"/>
<input type="button" value="set term" onClick="newGraph(document.getElementById('graphterm').value);">
</form>
</td>
<tr><td>&nbsp;</td></tr>
<script type="text/javascript">
// Get initial function term
var term = document.getElementById('graphterm').value;
// Recursion depth
var steps = 11;
// Start value for x
var x_0 = 3;
for (i = 0; i < steps; i++) {
     document.write('<tr><td><nobr>x<sub>' + i + '</sub> = </nobr></td><td><font id="xv' + i + '"></font></td></tr>');
}
</script>		
</table>
<center><div id="jxgboxa" style="height: 600px; width: 600px;"></div></center>
<script>
var i;
var brd = JXG.JSXGraph.initBoard('jxgboxa', {boundingbox:[-5, 5, 5, -5], axis:true, showCopyright: false,
        showZoom: false,
        showNavigation: false });
var ax = brd.defaultAxes.x;
var g = brd.create('functiongraph', [term], {strokeWidth: 2});
var x = brd.create('glider', [x_0, 0, ax], {name: 'x_{0}', color: 'magenta', size: 4});
newGraph(document.getElementById('graphterm').value);
newton(x, steps, brd);	
function xval() {
    for (i = 0; i < steps; i++) {
        document.getElementById('xv' + i).innerHTML = (brd.select('x_{' + i + '}').X()).toFixed(14);
    }
}
brd.on('update', xval);
// Initial call of xval()
xval();
function newton(p, i, board) {	
    board.suspendUpdate();	
    if (i > 0) {
        var f = board.create('glider', [function(){ return p.X(); }, function(){ return g.Y(p.X()) }, g], {
            name: '', style: 3, color: 'green'});
        var l = board.create('segment', [p, f], {strokeWidth: 0.5, dash: 1, strokeColor: 'black'});
        var t = board.create('tangent', [f], {strokeWidth: 0.5, strokeColor: '#0080c0', dash: 0});
        var x = board.create('intersection', [ax, t, 0],{name: 'x_{' + (steps - i + 1) + '}', style: 4, color: 'red'});
        newton(x, --i, board);
    }
    board.unsuspendUpdate();    
}
function newGraph(v) {
    g.generateTerm('x', 'x', v);
    //g.updateCurve();
    brd.update();
}
</script>
</div>

假设函数是 $f(x)$，我们写出切线方程：

$$y=f'(x_0)(x-x_0) + f(x_0)$$

令 $y=0$，那么

$$x=x_0-\frac{f(x_0)}{f'(x_0)}$$

将其运用到多项式上，就是：

$$G(x)=G_0(x)-\frac{F(G_0(x))}{F(G_0(x))}$$

这样每一次迭代精度会翻倍（证明见 [OI-Wiki](https://oi-wiki.org/math/poly/newton/)），于是我们可以使用牛顿迭代来进行一些多项式操作。

例如此题：

$$G(x)\equiv e^{F(x)} \pmod {x^n}$$

我们两边取对数：

$$\begin{aligned}\ln G(x)&\equiv F(x) &\pmod {x^n}\\
\ln G(x) - F(x) &\equiv 0 &\pmod {x^n}\end{aligned}$$

于是我们设 $H(G(x))=\ln G(x) - F(x)$，由于 $F(x)$ 在这里是常数，那么求导后得到 $H'(G(x))=\frac{1}{G(x)}$，那么牛顿迭代：

$$\begin{aligned}
G(x)&=G_0(x)-\frac{\ln G_0(x) - F(x)}{\frac{1}{G_0(x)}}\\
&=G_0(x)(1- \ln G_0(x) + F(x))\\
\end{aligned}$$

于是继续倍增就可以了！

```cpp
Polynomial exp(int n) {
    Polynomial b;
    b[0] = 1;
    for (int d = 1; d < (n << 1); d <<= 1) {
        Polynomial a = *this, e = b.ln(d);
        a.set(d - 1);
        b = b * (e * (P - 1) + a + 1);
        b.set(d - 1);
    }
    b.set(n - 1);
    return b;
}
```

## [多项式除法](https://www.luogu.com.cn/problem/P4512)

给定 $n$ 次多项式 $F(x)$ 和 $m$ 次多项式 $G(x)$，求一个 $n-m$ 次多项式 $Q(x)$ 和一个 $m - 1$ 次多项式 $R(x)$，满足 $F(x)=Q(x)G(x)+R(x)$。

我们设 $F_R(x)$ 为将 $F(x)$ 系数翻转之后的式子，也就是：

$$F_R(x)=\sum_{i=0}^na_{n-i}x^i$$

我们将 $\frac{1}{x}$ 带入：

$$\begin{aligned}
F\left(\frac{1}{x}\right)&=\sum_{i=0}^na_i\left(\frac{1}{x}\right)^i\\
&=\sum_{i=0}^na_ix^{-i}\\
&=\sum_{i=0}^na_{n-i}x^{i-n}\\
&=\frac{1}{x^n}\sum_{i=0}^na_{n-i}x^i\\
F\left(\frac{1}{x}\right)x^n&=F_R(x)\\
\end{aligned}$$

那么有：

$$\begin{aligned}
F\left(\frac{1}{x}\right)&=G\left(\frac{1}{x}\right)Q\left(\frac{1}{x}\right)+R\left(\frac{1}{x}\right)\\
F\left(\frac{1}{x}\right)x^n&=G\left(\frac{1}{x}\right)Q\left(\frac{1}{x}\right)x^n+R\left(\frac{1}{x}\right)x^n\\
F\left(\frac{1}{x}\right)x^n&=G\left(\frac{1}{x}\right)x^mQ\left(\frac{1}{x}\right)x^{n-m}+R\left(\frac{1}{x}\right)x^{m-1} \cdot x^{n-m+1}\\
F_R(x)&=G_R(x)Q_R(x)+R_R(x) \cdot x^{n-m+1}\\
\end{aligned}$$

$$\begin{aligned}
F_R(x)&\equiv G_R(x)Q_R(x) \pmod {x^{n-m+1}}\\
Q_R(x)&\equiv \frac{F_R(x)}{G_R(x)} \pmod {x^{n-m+1}}\\
\end{aligned}$$

而 $Q(x)$ 正好是 $n-m$ 次的，所以直接计算即可得到 $Q(x)$。

那么 $R(x)=F(x)-G(x)Q(x)$，即可计算出 $R(x)$。

```cpp
void reverse() { std::reverse(a.begin(), a.end()); }
pair<Polynomial, Polynomial> operator/(Polynomial b) {
    int n = len, m = b.len;
    Polynomial ra = *this, rb = b, rc, d;
    ra.reverse(), rb.reverse();
    rc = ra * rb.inv(n - m + 1);
    rc.set(n - m);
    rc.reverse();
    d = *this - b * rc;
    d.set(m - 1);
    return make_pair(rc, d);
}
```

## [位运算卷积](https://www.luogu.com.cn/problem/P4717)

位运算卷积，就是设一个位运算 $\oplus$，求：

$$\sum_{i\oplus j=k}a_ib_j$$

我们要使用的转换叫做**快速沃尔什变换(FWT)/快速莫比乌斯变换(FMT)**。

咕了。

[link](https://www.luogu.com.cn/problem/solution/P4717)

附上我目前的模板：

```cpp
#include <bits/stdc++.h>
using namespace std;
const int MAXN = 20000005, P = 998244353, G = 3, GI = 332748118;
int qpow(int a, int b) {
    int ans = 1;
    while (b) {
        if (b & 1) ans = 1ll * ans * a % P;
        a = 1ll * a * a % P;
        b >>= 1;
    }
    return ans;
}
int r[MAXN];
struct Polynomial {
    vector<int> a;
    int len;
    int& operator[](int b) { return a[b]; }
    Polynomial(int len = 0) : len(len) { a.resize(len + 1); }
    Polynomial& set(int b) { len = b, a.resize(b + 1); return *this; }
    static Polynomial resize(Polynomial a, int s) { Polynomial b = a; return b.set(s); }
    void reverse() { std::reverse(a.begin(), a.end()); }
    static void calcRev(int limit) {
        for (int i = 1; i < limit; i++)
            r[i] = (r[i >> 1] >> 1) | ((i & 1) * limit >> 1);
    }
    void ntt(int limit, bool rev) {
        set(limit);
        for (int i = 0; i < limit; i++)
            if (i < r[i]) swap(a[i], a[r[i]]);
        for (int mid = 1; mid < limit; mid <<= 1) {
            int step = qpow(rev ? GI : G, (P - 1) / (mid << 1));
            for (int l = 0; l < limit; l += (mid << 1)) {
                int w = 1;
                for (int j = 0; j < mid; j++, w = 1ll * w * step % P) {
                    int x = a[l + j], y = 1ll * w * a[l + j + mid] % P;
                    a[l + j] = (x + y) % P, a[l + j + mid] = (1ll * P + x - y) % P;
                }
            }
        }
        int invn = qpow(limit, P - 2);
        if (rev) {
            for (int i = 0; i < limit; i++) 
                a[i] = 1ll * a[i] * invn % P;
        }
    }
    void print() { for (int i : a) printf("%d ", i); printf("\n"); }
    Polynomial operator*(Polynomial b) {
        Polynomial a = *this, c;
        int n = a.len + b.len;
        int limit = 1;
        while (limit <= n) limit <<= 1;
        c.set(limit);
        calcRev(limit);
        a.ntt(limit, 0), b.ntt(limit, 0);
        for (int i = 0; i <= limit; i++) c[i] = 1ll * a[i] * b[i] % P;
        c.ntt(limit, 1);
        c.set(n);
        return c;
    }
    Polynomial operator*(int b) {
        Polynomial c = *this;
        for (int& i : c.a) i = 1ll * i * b % P;
        return c;
    }
    Polynomial operator+(int b) {
        Polynomial c = *this;
        c[0] = (1ll * c[0] + b + P) % P;
        return c;
    }
    Polynomial operator+(Polynomial b) {
        Polynomial c = *this;
        c.set(max(c.len, b.len));
        for (int i = 0; i <= b.len; i++) c[i] = (c[i] + b[i]) % P;
        return c;
    }
    Polynomial operator-(Polynomial b) {
        Polynomial c = *this;
        c.set(max(c.len, b.len));
        for (int i = 0; i <= b.len; i++) c[i] = (c[i] - b[i] + P) % P;
        return c;
    }
    void OR(int limit, bool rev) {
        for (int mid = 1; mid <= limit; mid <<= 1) {
            for (int l = 0; l < limit; l += (mid << 1)) {
                for (int j = 0; j < mid; j++) {
                    a[l + j + mid] =
                        (a[l + j + mid] + (rev ? P - a[l + j] : a[l + j])) % P;
                }
            }
        }
    }
    Polynomial operator|(Polynomial b) {
        Polynomial a = *this, c(len);
        a.OR(len, 0), b.OR(len, 0);
        for (int i = 0; i <= len; i++) c[i] = 1ll * a[i] * b[i] % P;
        c.OR(len, 1);
        return c;
    }
    void AND(int limit, bool rev) {
        for (int mid = 1; mid <= limit; mid <<= 1) {
            for (int l = 0; l < limit; l += (mid << 1)) {
                for (int j = 0; j < mid; j++) {
                    a[l + j] =
                        (a[l + j] + (rev ? P - a[l + j + mid] : a[l + j + mid])) % P;
                }
            }
        }
    }
    Polynomial operator&(Polynomial b) {
        Polynomial a = *this, c(len);
        a.AND(len, 0), b.AND(len, 0);
        for (int i = 0; i <= len; i++) c[i] = 1ll * a[i] * b[i] % P;
        c.AND(len, 1);
        return c;
    }
    void XOR(int limit, bool rev) {
        static int TWOINV = qpow(2, P - 2);
        for (int mid = 1; mid <= limit; mid <<= 1) {
            for (int l = 0; l < limit; l += (mid << 1)) {
                for (int j = 0; j < mid; j++) {
                    int x = a[l + j], y = a[l + j + mid];
                    a[l + j] = (x + y) % P, a[l + j + mid] = (x - y + P) % P;
                    if (rev)
                        a[l + j] = 1ll * a[l + j] * TWOINV % P,
                              a[l + j + mid] =
                                  1ll * a[l + j + mid] * TWOINV % P;
                }
            }
        }
    }
    Polynomial operator^(Polynomial b) {
        Polynomial a = *this, c(len);
        a.XOR(len, 0), b.XOR(len, 0);
        for (int i = 0; i <= len; i++) c[i] = 1ll * a[i] * b[i] % P;
        c.XOR(len, 1);
        return c;
    }
    Polynomial inv(int n) {
        Polynomial b;
        b[0] = qpow(a[0], P - 2);
        for (int d = 1; d < (n << 1); d <<= 1) {
            Polynomial a = *this;
            a.set(d - 1);
            int limit = d << 1;
            calcRev(limit);
            a.ntt(limit, 0), b.ntt(limit, 0);
            for (int i = 0; i < limit; i++) b[i] = (2ll - 1ll * a[i] * b[i] % P + P) % P * b[i] % P;
            b.ntt(limit, 1);
            b.set(d - 1);
        }
        b.set(n - 1);
        return b;
    }
    Polynomial sqrt(int n) {
        static int TWOINV = qpow(2, P - 2);
        Polynomial b;
        b[0] = 1;
        for (int d = 1; d < (n << 1); d <<= 1) {
            Polynomial a = *this, c = b.inv(d);
            a.set(d - 1);
            int limit = d << 1;
            calcRev(limit);
            a.ntt(limit, 0), c.ntt(limit, 0);
            for (int i = 0; i < limit; i++) a[i] = 1ll * a[i] * c[i] % P;
            a.ntt(limit, 1);
            b.set(d - 1);
            for (int i = 0; i < d; i++) b[i] = 1ll * (a[i] + b[i]) * TWOINV % P;
        }
        b.set(n - 1);
        return b;
    }
    Polynomial derivative() {
        Polynomial b(len - 1);
        for (int i = 1; i <= len; i++) b[i - 1] = 1ll * a[i] * i % P;
        return b;
    }
    Polynomial integral() {
        Polynomial b(len + 1);
        for (int i = 0; i <= len; i++) b[i + 1] = 1ll * a[i] * qpow(i + 1, P - 2) % P;
        return b;
    }
    Polynomial ln(int n) {
        return (derivative() * inv(n)).integral().set(n - 1);
    }
    Polynomial exp(int n) {
        Polynomial b;
        b[0] = 1;
        for (int d = 1; d < (n << 1); d <<= 1) {
            Polynomial a = *this, e = b.ln(d);
            a.set(d - 1);
            b = b * (e * (P - 1) + a + 1);
            b.set(d - 1);
        }
        b.set(n - 1);
        return b;
    }
    Polynomial pow(int b, int n) {
        return (ln(n) * b).exp(n);
    }
    pair<Polynomial, Polynomial> operator/(Polynomial b) {
        int n = len, m = b.len;
        Polynomial ra = *this, rb = b, rc, d;
        ra.reverse(), rb.reverse();
        rc = ra * rb.inv(n - m + 1);
        rc.set(n - m);
        rc.reverse();
        d = *this - b * rc;
        d.set(m - 1);
        return make_pair(rc, d);
    }
};
```