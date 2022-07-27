---
layout: post
title: 「解题报告」NOIP2021模拟19 乘法
date: 2021-10-30
tags: 算法  组合数学  数学  斯特林数  动态规划  DP
---
> ## 题目描述
> 求 $n!$ 的十六进制下去尾零后的后十六位。多组测试数据。
> ## 数据范围
> $T \le 10,n < 2^{64}$

~~这题目太简洁了，awsl~~

## 思路

~~开始裂开~~

十六进制下的十六位就是 $(2^4)^{16}=2^{64}$， 就是 `unsigned long long` 的数据范围， 暴力直接自然溢出即可。十六进制下的尾零就是 $2^4$， 所以每次乘一个数先将它的所有 $2$ 的质因子除去， 并记录 $2$ 的个数， 最后 $\bmod 4$ 再乘回去就可以了。

这启发我们首先将所有的 $2$ 提取出来， 记录 $2$ 的个数。我们可以发现：

```
1
2  -> 1
3
4  -> 2 -> 1
5
6  -> 3
7
8  -> 4 -> 2 -> 1
9
10 -> 5
11
12 -> 6 -> 3
13
14 -> 7
15
16 -> 8 -> 4 -> 2 -> 1
...
```

不难发现最后得到的是若干个奇数序列的乘积， 并且奇数序列个数是 $\log$ 级别的。

所以我们考虑求 $[1,n]$ 中所有奇数的乘积， 即 $\displaystyle \prod_{i=0}^{\frac{n-1}{2}}(2i+1)$。

这个式子可以将括号拆开，得到的若干项相加就是结果。而我们可以发现， $2i$ 项如果选择超过 $64$ 就对答案没有贡献了，因为这一项就一定是 $2^{64}$ 的倍数， 自然溢出后就是 $0$。

所以我们不妨再进一步，求当选择 $m$ 个 $2i$ 项时的乘积和为多少。我们可以将 $2$ 提出来，也就是求 $2^m$ 乘上从 $[1,n]$ 中选择 $m$ 个数的所有方案的乘积之和。

打 表 可 得：

| n\m | 1 | 2 | 3 | 4 |
| --- | - | - | - | - |
|  1  | 1 |   |   |   |
|  2  | 3 | 2 |   |   |
|  3  | 6 |11 | 6 |   |
|  4  |10 |35 |50 |24 |

发现这个数和第一类斯特林数很像，事实上这个数就是 $\displaystyle {n + 1 \brack n - m + 1}$

考虑第一类斯特林数的含义：将 $n + 1$ 个数划分为 $n - m + 1$ 个轮换。 $n$ 很大，但是 $m$ 相对较小， 最大值为 $64$， 也就是划分出的轮换大部分长度应该都是 $1$。

于是我们可以考虑求出 $n$ 个数组成 $m$ 个长度大于 $1$ 的轮换的方案数。

设 $dp_{n,m}$ 为以上定义，那么可以得出：

$$\begin{aligned}
dp_{i, j}&=\sum_{k=2}^i\binom{i-1}{k-1}{k \brack 1}dp_{i-k,j-1}\\
&=\sum_{k=2}^i\binom{i-1}{k-1}(k-1)!dp_{i-k,j-1}\\
&=\sum_{k=2}^i\mathrm{A}_{i-1}^{k-1}dp_{i-k,j-1}\\
\end{aligned}$$

设 $b=64$， 那么排列数可以 $O(b^2)$ 预处理出来， $dp$ 数组可以 $O(b^3)$ 预处理出来。

然后回到 $\displaystyle {n + 1 \brack n - m + 1}$， 我们就可以得出：

$${n + 1\brack n-m+1}=\sum_{i}\binom{n + 1}{i}dp_{i,i-m}$$

这个组合数的 $n$ 很大， 我们可以尝试直接用式子算：

$$\binom{n + 1}{i}=\frac{(n+1)!}{i!(n+1-i)!}$$

$i$ 很小， 所以我们可以直接处理出 $i!$ 的逆元。 但是模数为 $2^{64}$， 与偶数不互质， 而正好我们需要把所有的 $2$ 都提取出来， 所以直接处理所有奇数的逆元就可以了。

这样， 再暴力将 $\frac{(n+1)!}{(n+1-i)!}$ 中的 $2$ 算去， 算结果即可。

处理奇数的逆元我们需要用到欧拉定理：

$$x^b\equiv x^{b\bmod \varphi(p)}\pmod{p}$$

$\varphi(2) = 1$， 那么 $\varphi(2^{64}) = 2^{63}$， 那么 $a^{-1}\equiv a^{2^{63}-1} \pmod{2^{64}}$， 直接快速幂可以算出，也可以算出 $a^{2^{63}-1} = a^{2^0+2^1+2^2+\cdots+2^{63}} = a^{2^0} \times a^{2^1} \times \cdots \times a^{a^{62}}$， 将 $a$ 不断平方并乘起来即可。

接下来我们解决最后的问题：求出 $[1,n]$ 中所有奇数的乘积。

和上面所说的一样，枚举选择 $m$ 个 $2i$ 项， 然后利用上面得出的结论计算即可。

$$\sum_{m=1}^{64}2^i\sum_{m}\binom{\frac{n+1}{2}}{i}dp_{i,i-m}$$

$n + 1$ 变为 $\frac{n+1}{2}$ 的原因有 $\frac{n+1}{2}$ 个奇数， 而 $1$ 拆分为 $1\times 0+1$ 不在 $[1,\frac{n+1}{2}]$ 的范围内， 所以要减去 $1$。

最后， 将 $n$ 不断除以 $2$， 算出每一个奇数序列的乘积相乘就是最后的答案了。

## 代码

```cpp
#include <bits/stdc++.h>
#define ull unsigned long long
using namespace std;

ull cnt[150];
ull dp[150][150], a[150][150], inv[150];
char c[17] = "0123456789ABCDEF";

void printHex(unsigned long long a) {
	for (int i = 16; i >= 1; i--) {
		if ((a >> ((i - 1) * 4)) != 0) printf("%c", c[(a >> ((i - 1) * 4)) % (1 << 4)]);
	}
	printf("\n");
}
ull C(ull n, ull m) {
	ull cc = 0;
	ull ans = 1;
	for (ull i = 1; i <= m; i++) {
		cc += cnt[i];
		ans *= inv[i]; 
	}
	for (ull i = n; i >= n - m + 1; i--) {
		ull j = i;
		while (cc && j % 2 == 0) j /= 2, cc--;
		ans *= j;
	}
	return ans;
}

ull f(ull n) {
	n = ((n - 1) >> 1) + 1;
	ull ans = 0;
	for (int i = 0; i < 64 && i < n; i++) {
		ull a = 0;
		for (int j = i; j <= 2 * i && j <= n; j++) {
			a += C(n, j) * dp[j][j - i];
		}
		ans += (a << i);
	}
	return ans;
}

int main () {
	a[0][0] = 1;
	for (int i = 1; i <= 140; i++) {
		a[i][0] = 1;
		for (int j = 1; j <= i; j++) {
			a[i][j] = a[i][j - 1] * (i - j + 1);
		}
	}
	dp[0][0] = 1;
	for (int i = 1; i <= 140; i++) {
		for (int j = 1; j <= i; j++) {
			for (int k = 2; k <= i; k++) {
				dp[i][j] += a[i - 1][k - 1] * dp[i - k][j - 1];
			}
		}
	}
	for (int i = 1; i <= 130; i++) {
		ull j = i;
		while (j % 2 == 0) j /= 2, cnt[i]++;
		ull z = 1;
		for (int q = 0; q <= 62; q++) z *= j, j *= j;
		inv[i] = z;
	}
	int T; scanf("%d", &T);
	while (T--) {
		ull n; scanf("%llu", &n);
		ull cc = 0;
		ull ans = 1;
		while (n) ans *= f(n), n >>= 1, cc = (cc + n) % 4;
		printHex(ans << cc);
	}
	return 0;
}
```

## 小记

~~简介的题面，不简洁的做法~~

~~可以说是很裂开了~~

关于前三道题都想到正解，两个半小时就写完后花两个小时想这题，结果T2和T3都挂分挂飞：/

一定要手造数据 一定要手造数据 一定要手造数据