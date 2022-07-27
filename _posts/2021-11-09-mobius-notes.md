---
layout: post
title: 「学习笔记」莫比乌斯反演套路总结
date: 2021-11-09
tags: 算法  学习笔记  数学  莫比乌斯反演

---
## 基本套路
> [Crash的数字表格 / JZPTAB](https://www.luogu.com.cn/problem/P1829)  
> 求：
> $$\sum_{i=1}^n\sum_{j=1}^m\mathrm{lcm}(i,j)$$

$$\begin{aligned}
 &\sum_{i=1}^n\sum_{j=1}^m\mathrm{lcm}(i,j)\\
=&\sum_{i=1}^n\sum_{j=1}^m\frac{ij}{\gcd(i,j)}\\
=&\sum_{d=1}^{\min(n,m)}\sum_{i=1}^{\lfloor\frac{n}{d}\rfloor}\sum_{j=1}^{\lfloor\frac{m}{d}\rfloor}ijd[\gcd(i,j)=1]
&\text{套路1：枚举}\gcd(i,j)\\
=&\sum_{d=1}^{\min(n,m)}d\sum_{i=1}^{\lfloor\frac{n}{d}\rfloor}\sum_{j=1}^{\lfloor\frac{m}{d}\rfloor}ij\sum_{k|\gcd(i,j)}\mu(k)
&\text{套路2：拆开}[\gcd(i,j)=1]\\
=&\sum_{d=1}^{\min(n,m)}d\sum_{k=1}^{\frac{\min(n,m)}{d}}k^2\mu(k)\sum_{i=1}^{\lfloor\frac{n}{kd}\rfloor}\sum_{j=1}^{\lfloor\frac{m}{kd}\rfloor}ij\\
=&\sum_{d=1}^{\min(n,m)}d\sum_{k=1}^{\frac{\min(n,m)}{d}}k^2\mu(k)\sum_{i=1}^{\lfloor\frac{n}{kd}\rfloor}i\sum_{j=1}^{\lfloor\frac{m}{kd}\rfloor}j
&\text{套路3：枚举}k\\
=&\sum_{d=1}^{\min(n,m)}d\sum_{k=1}^{\frac{\min(n,m)}{d}}k^2\mu(k)\frac{\lfloor\frac{n}{kd}\rfloor(\lfloor\frac{n}{kd}\rfloor+1)}{2}\times\frac{\lfloor\frac{m}{kd}\rfloor(\lfloor\frac{m}{kd}\rfloor+1)}{2}\\
=&\sum_{T=1}^{\min(n,m)}\sum_{k|T}\frac{T}{k}\times k^2\mu(k)\frac{\lfloor\frac{n}{T}\rfloor(\lfloor\frac{n}{T}\rfloor+1)}{2}\times\frac{\lfloor\frac{m}{T}\rfloor(\lfloor\frac{m}{T}\rfloor+1)}{2}
&\text{套路4：设}T=kd\\
=&\sum_{T=1}^{\min(n,m)}T\times \frac{\lfloor\frac{n}{T}\rfloor(\lfloor\frac{n}{T}\rfloor+1)}{2}\times\frac{\lfloor\frac{m}{T}\rfloor(\lfloor\frac{m}{T}\rfloor+1)}{2}\sum_{k|T}k\mu(k)\\
\end{aligned}$$

$O(n\log n)$ 暴力计算出 $g(T)=\sum_{k\mid T}k\mu(k)$ 的前缀和， 再进行数论分块即可。

## 拆函数

$$\varphi(ij)=\frac{\varphi(i)\varphi(j)}{\varphi(\gcd(i,j))}\times \gcd(i,j)$$

$$\mu(ij)=\mu(i)\mu(j)[\gcd(i,j)=1]$$

$$d(ij)=\sum_{x|i}\sum_{y|j}[\gcd(x,y)=1]$$

## 线性筛求函数前缀和

> [于神之怒加强版](https://www.luogu.com.cn/problem/P4449)  
> 前部分省略。  
> 最后需要求一个函数的前缀和：  
> $$g(T)=\sum_{d|T}d^k\mu(\frac{T}{d})$$

两个积性函数的卷积也是积性函数，可以将 $g(T)$ 拆为 $\prod{g(p_i^{c_i})}$。

$$\begin{aligned}
g(T)&=\prod g(p_i^{c_i})\\
&=\prod (p_i^{k\times (c_i-1)}\times \mu(p_i)+p_i^{k\times c_i}\times \mu(i))\\
&=\prod (p_i^{k\times (c_i-1)}\times (p_i^k-1))
\end{aligned}$$

因为线性筛是不断乘质因子的过程，所以这样就可以线性筛求出这个函数。