---
layout: post
title: 「乘法逆元」递推求解
date: 2021-07-13
tags: 数学  数论  乘法逆元
---
## $1 \sim N$ 乘法逆元
首先

$$1^{-1} \equiv 1\pmod{P} $$

设

$$P=k\times i+r$$  

则

$$k\times i+r\equiv 0 \pmod{P}$$  

两边同时乘$i^{-1}\times r^{-1}$，得

$$
\begin{aligned}
k\times r^{-1}+i^{-1}&\equiv0&\pmod{P}\\
i^{-1}&\equiv-k\times r^{-1}&\pmod{P}\\
i^{-1}&\equiv-\lfloor\frac{P}{i}\rfloor\times (P\ mod\ i)^{-1}&\pmod{P}
\end{aligned}
$$

**代码实现：**  
```cpp
inv[i] = (p-p/i) * inv[p%i] % p;
```
**题目传送门：** [P3811](https://www.luogu.com.cn/problem/P3811)

## $1! \sim N!$ 乘法逆元
首先求出$N!^{-1}$,  
设$N=a$，则

$$
\begin{aligned}
a!x&\equiv1&\pmod{P}\\
(a-1)!\times ax&\equiv1&\pmod{P}
\end{aligned}
$$

则 $ax$ 即为 $(a-1)!$ 的乘法逆元.  

**代码实现：**
```cpp
jc_inv[i] = jc_inv[i+1] * (i+1) % P;
```