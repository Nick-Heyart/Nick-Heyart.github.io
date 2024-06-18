# Page title

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Suspendisse ultrices gravida dictum fusce. Urna neque viverra justo nec ultrices. Ornare massa eget egestas purus viverra accumsan. Pellentesque elit eget gravida cum sociis. Leo vel orci porta non pulvinar neque laoreet. Aliquam etiam erat velit scelerisque in dictum non consectetur. Quis imperdiet massa tincidunt nunc pulvinar sapien et. Quis commodo odio aenean sed adipiscing diam donec. Commodo elit at imperdiet dui. Iaculis nunc sed augue lacus viverra. Risus feugiat in ante metus.

## Secondary title

![](/img/placeholder/ph5.png)

Ultrices vitae auctor eu augue. Pellentesque nec nam aliquam sem et tortor consequat id. Ut eu sem integer vitae justo eget magna. A diam sollicitudin tempor id eu nisl nunc mi. Tristique nulla aliquet enim tortor at auctor urna nunc id. Massa tincidunt nunc pulvinar sapien et ligula. Est ante in nibh mauris cursus mattis molestie. Diam sit amet nisl suscipit adipiscing bibendum est. Ultrices gravida dictum fusce ut placerat orci nulla pellentesque dignissim. Quam vulputate dignissim suspendisse in.

### Tertiary title

- Bullet 1
- Bullet 2
  - Sub bullet 1
  - Sub bullet 2
    - Sub-sub bullet
    - another one
- Long entry; Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
  Suspendisse ultrices gravida dictum fusce. Urna neque viverra justo nec
  ultrices. Ornare massa eget egestas purus viverra accumsan.
- yep

## Section with a bunch of images

![](/img/placeholder/ph1.png)
![](/img/placeholder/ph2.png)
![](/img/placeholder/ph3.png)

Egestas fringilla phasellus faucibus scelerisque eleifend donec pretium vulputate sapien. Viverra maecenas accumsan lacus vel facilisis volutpat. Urna porttitor rhoncus dolor purus non enim praesent. A erat nam at lectus urna. Commodo quis imperdiet massa tincidunt nunc pulvinar sapien et. Risus quis varius quam quisque id diam vel. Blandit aliquam etiam erat velit scelerisque in. In hac habitasse platea dictumst vestibulum rhoncus. Diam maecenas ultricies mi eget. In tellus integer feugiat scelerisque varius morbi enim nunc faucibus. In nisl nisi scelerisque eu ultrices vitae auctor eu. Nec tincidunt praesent semper feugiat nibh sed pulvinar proin gravida. Nunc sed id semper risus in hendrerit gravida rutrum. Elit at imperdiet dui accumsan sit. Velit sed ullamcorper morbi tincidunt ornare. Sed cras ornare arcu dui vivamus arcu felis bibendum. Vitae tortor condimentum lacinia quis vel.

Aliquet eget sit amet tellus cras. Neque viverra justo nec ultrices. Scelerisque viverra mauris in aliquam sem fringilla ut. Sit amet luctus venenatis lectus magna fringilla urna porttitor rhoncus. Egestas sed sed risus pretium quam vulputate dignissim. Augue ut lectus arcu bibendum at varius vel pharetra. Vitae et leo duis ut diam quam nulla. Sit amet massa vitae tortor. Aliquam ultrices sagittis orci a scelerisque purus semper eget. Molestie nunc non blandit massa enim nec dui. Maecenas accumsan lacus vel facilisis volutpat est velit egestas. Non arcu risus quis varius quam quisque. Ut aliquam purus sit amet luctus venenatis. Tellus molestie nunc non blandit massa. Convallis a cras semper auctor neque. Vestibulum rhoncus est pellentesque elit ullamcorper dignissim cras tincidunt lobortis. Sodales ut eu sem integer vitae. Quam lacus suspendisse faucibus interdum posuere lorem ipsum dolor sit. Pellentesque elit ullamcorper dignissim cras tincidunt lobortis feugiat vivamus at. Quis viverra nibh cras pulvinar mattis nunc sed blandit.

Aenean vel elit scelerisque mauris. Faucibus ornare suspendisse sed nisi lacus. Netus et malesuada fames ac turpis. Sem et tortor consequat id porta nibh. Ut tellus elementum sagittis vitae et leo duis ut diam. Viverra nam libero justo laoreet sit amet cursus sit. Vitae congue eu consequat ac felis donec et odio. Viverra justo nec ultrices dui sapien eget mi. Enim praesent elementum facilisis leo vel. Sed sed risus pretium quam vulputate dignissim. Justo laoreet sit amet cursus sit amet dictum. Tortor id aliquet lectus proin nibh nisl condimentum id venenatis. Arcu ac tortor dignissim convallis aenean et tortor at. Ut tristique et egestas quis ipsum suspendisse.

A wise man once said:

>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Suspendisse ultrices gravida dictum fusce. Urna neque viverra justo nec ultrices. Ornare massa eget egestas purus viverra accumsan. Pellentesque elit eget gravida cum sociis. Leo vel orci porta non pulvinar neque laoreet. Aliquam etiam erat velit scelerisque in dictum non consectetur. Quis imperdiet massa tincidunt nunc pulvinar sapien et. Quis commodo odio aenean sed adipiscing diam donec. Commodo elit at imperdiet dui. Iaculis nunc sed augue lacus viverra. Risus feugiat in ante metus.

Guys look at my physics solver. The website only has to put it in a box and do syntax highlighting since everything is already _monospace._

```Java
import java.awt.*;

public class BoxPhysicsSolver {
    private static final double GRAVITY = 9.81; // Gravity constant (m/s^2)
    private static final double FRICTION_COEFFICIENT = 0.5; // Coefficient of friction

    private Rectangle box;
    private double velocityX;
    private double velocityY;

    public BoxPhysicsSolver(Rectangle box) {
        this.box = box;
        this.velocityX = 0;
        this.velocityY = 0;
    }

    public void update(double deltaTime) {
        // Apply gravity
        velocityY += GRAVITY * deltaTime;

        // Apply friction
        velocityX *= Math.pow(1 - FRICTION_COEFFICIENT, deltaTime);

        // Update position
        box.x += velocityX * deltaTime;
        box.y += velocityY * deltaTime;

        // Check collision with boundaries
        if (box.y < 0) { // Top boundary
            box.y = 0;
            velocityY = -velocityY; // Reverse velocity on collision
        }
        if (box.y + box.height > screenHeight) { // Bottom boundary
            box.y = screenHeight - box.height;
            velocityY = -velocityY; // Reverse velocity on collision
        }
        if (box.x < 0) { // Left boundary
            box.x = 0;
            velocityX = -velocityX; // Reverse velocity on collision
        }
        if (box.x + box.width > screenWidth) { // Right boundary
            box.x = screenWidth - box.width;
            velocityX = -velocityX; // Reverse velocity on collision
        }
    }

    // Example method to handle collisions with other boxes
    public void handleCollision(Rectangle otherBox) {
        if (box.intersects(otherBox)) {
            // Collision detected, implement collision resolution here
            // For example, you can reverse velocities or apply impulse
        }
    }

    // Example method to apply external forces
    public void applyForce(double forceX, double forceY) {
        // Apply force to the box
        velocityX += forceX;
        velocityY += forceY;
    }
}
```

Who up `updating` they `deltaTime`

in the `finalV2.py`, straight up `import`ing `it`

and let's just say that by `it`, I mean `random`

```Python
import random
import string

def generate_random_password(length=12):
    characters = string.ascii_letters + string.digits + string.punctuation
    password = ''.join(random.choice(characters) for _ in range(length))
    return password

random_password = generate_random_password()
print("Random Password:", random_password)
```

All of this code came from ChatGPT if you couldn't tell, its entire purpose is to test syntax highlighting.

```Rust
use image::{ImageBuffer, Rgb};
use std::fs::File;

const WIDTH: u32 = 800;
const HEIGHT: u32 = 800;
const MAX_ITER: u32 = 100;

fn mandelbrot(c: num_complex::Complex<f64>) -> u32 {
    let mut z = num_complex::Complex::new(0.0, 0.0);
    for i in 0..MAX_ITER {
        if z.norm_sqr() > 4.0 {
            return i;
        }
        z = z * z + c;
    }
    MAX_ITER
}

fn main() {
    let imgx = WIDTH;
    let imgy = HEIGHT;

    let mut imgbuf = ImageBuffer::new(imgx, imgy);

    for (x, y, pixel) in imgbuf.enumerate_pixels_mut() {
        let cx = x as f64 / imgx as f64 * 3.5 - 2.5;
        let cy = y as f64 / imgy as f64 * 2.0 - 1.0;
        let c = num_complex::Complex::new(cx, cy);

        let pixel_value = mandelbrot(c);
        let pixel_value = 255 - (pixel_value * 255 / MAX_ITER) as u8;

        *pixel = Rgb([pixel_value, pixel_value, pixel_value]);
    }

    let ref mut fout = File::create("mandelbrot.png").unwrap();
    image::ImageRgb8(imgbuf).save(fout, image::PNG).unwrap();
}
```

ChatGPT'd bash script that prints a mandelbrot set to stdout, actually works surprisingly.

```Bash
#!/bin/bash

# Define the dimensions of the ASCII Mandelbrot set
WIDTH=80
HEIGHT=24

# Define the bounds of the complex plane
RE_START=-2.0
RE_END=1.0
IM_START=-1.0
IM_END=1.0

# Define the maximum number of iterations
MAX_ITER=1000

# Function to calculate the Mandelbrot set
mandelbrot() {
    local re=$1
    local im=$2
    local re0=$re
    local im0=$im
    local n=0

    while [ $(echo "$re * $re + $im * $im < 4.0" | bc) -eq 1 ] && [ $n -lt $MAX_ITER ]; do
        local re_temp=$(echo "$re * $re - $im * $im + $re0" | bc -l)
        im=$(echo "2 * $re * $im + $im0" | bc -l)
        re=$re_temp
        n=$((n + 1))
    done

    echo $n
}

# Generate the ASCII Mandelbrot set
for ((y = 0; y < HEIGHT; y++)); do
    for ((x = 0; x < WIDTH; x++)); do
        # Map the current pixel to the complex plane
        re=$(echo "$RE_START + ($x / $WIDTH) * ($RE_END - $RE_START)" | bc -l)
        im=$(echo "$IM_START + ($y / $HEIGHT) * ($IM_END - $IM_START)" | bc -l)

        # Calculate the number of iterations
        iter=$(mandelbrot $re $im)

        # Print a character based on the number of iterations
        if [ $iter -eq $MAX_ITER ]; then
            printf "#"
        else
            printf " "
        fi
    done
    echo
done
```

C version that runs stupid fast

```C
#include <stdio.h>
#include <complex.h>

#define WIDTH 80
#define HEIGHT 24
#define MAX_ITER 1000

void mandelbrot(double re, double im, int *iter) {
    double complex z = 0 + 0*I;
    double complex c = re + im*I;

    *iter = 0;
    while (cabs(z) <= 2 && *iter < MAX_ITER) {
        z = z*z + c;
        (*iter)++;
    }
}

int main() {
    double re_start = -2.0, re_end = 1.0;
    double im_start = -1.0, im_end = 1.0;

    for (int y = 0; y < HEIGHT; y++) {
        for (int x = 0; x < WIDTH; x++) {
            double re = re_start + (double)x / WIDTH * (re_end - re_start);
            double im = im_start + (double)y / HEIGHT * (im_end - im_start);

            int iter;
            mandelbrot(re, im, &iter);

            if (iter == MAX_ITER) {
                printf("#");
            } else {
                printf(" ");
            }
        }
        printf("\n");
    }

    return 0;
}
```

## LaTeX test
### Inline mode
Formatting is intentionally bad, remember that we are trying to break stuff here.

> OK kids, today we are going to sing the alphabet! repeat after me: $\alpha, \beta, \gamma, \delta, \epsilon, \zeta, \eta, \theta, \iota, \kappa, \lambda, \mu, \nu, \xi, \pi, \rho, \sigma, \tau, \upsilon, \phi, \chi, \psi, \omega$

> Straight up $\iota \sigma \gamma \kappa $ ing it

$A = \begin{pmatrix} a & b \\ c & d \end{pmatrix}$
$B = \begin{bmatrix} e & f \\ g & h \end{bmatrix}$
$C = \begin{matrix} i & j \\ k & l \end{matrix}$ Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Suspendisse ultrices gravida dictum fusce. Urna neque viverra justo nec ultrices. Ornare massa eget egestas purus viverra accumsan. Pellentesque elit eget gravida cum sociis. Leo vel orci porta non pulvinar neque laoreet. Aliquam etiam erat velit scelerisque in dictum non consectetur. Quis imperdiet massa tincidunt nunc pulvinar sapien et. Quis commodo odio aenean sed adipiscing diam donec. Commodo elit at imperdiet dui. Iaculis nunc sed augue lacus viverra. Risus feugiat in ante metus.
$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$ Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Suspendisse ultrices gravida dictum fusce. Urna neque viverra justo nec ultrices. Ornare massa eget egestas purus viverra accumsan. Pellentesque elit eget gravida cum sociis. Leo vel orci porta non pulvinar neque laoreet. Aliquam etiam erat velit scelerisque in dictum non consectetur. Quis imperdiet massa tincidunt nunc pulvinar sapien et. Quis commodo odio aenean sed adipiscing diam donec. Commodo elit at imperdiet dui. Iaculis nunc sed augue lacus viverra. Risus feugiat in ante metus.

$\int_{a}^{b} f(x) \, dx = F(b) - F(a)$

$e^{i\pi} + 1 = 0$

$\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}$

$\lim_{x \to 0} \frac{\sin x}{x} = 1$

$\binom{n}{k} = \frac{n!}{k!(n-k)!}$

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Suspendisse ultrices gravida dictum fusce. Urna neque viverra justo nec ultrices. Ornare massa eget egestas purus viverra accumsan. Pellentesque elit eget gravida cum sociis. Leo vel orci porta non pulvinar neque laoreet. Aliquam etiam erat velit scelerisque in dictum non consectetur. Quis imperdiet massa tincidunt nunc pulvinar sapien et. Quis commodo odio aenean sed adipiscing diam donec. Commodo elit at imperdiet dui. Iaculis nunc sed augue lacus viverra. Risus feugiat in ante metus. $\begin{aligned} a + b &= c \\ d - e &= f \\ g \times h &= i \\ j \div k &= l \end{aligned}$ Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Suspendisse ultrices gravida dictum fusce. Urna neque viverra justo nec ultrices. Ornare massa eget egestas purus viverra accumsan. Pellentesque elit eget gravida cum sociis. Leo vel orci porta non pulvinar neque laoreet. Aliquam etiam erat velit scelerisque in dictum non consectetur. Quis imperdiet massa tincidunt nunc pulvinar sapien et. Quis commodo odio aenean sed adipiscing diam donec. Commodo elit at imperdiet dui. Iaculis nunc sed augue lacus viverra. Risus feugiat in ante metus.

$\begin{cases} ax + by = c \\ dx + ey = f \end{cases}$

$\begin{array}{c|c} a & b \\ \hline c & d \end{array}$

$\mathbb{R}, \mathbb{Z}, \mathbb{N}, \mathbb{Q}, \mathbb{C}$
![](/img/placeholder/ph1.png)
![](/img/placeholder/ph2.png)
![](/img/placeholder/ph3.png)
$\mathcal{A}, \mathcal{B}, \mathcal{C}, \mathcal{D}, \mathcal{E}, \mathcal{F}, \mathcal{G}$

- $\mathfrak{a}, \mathfrak{b}, \mathfrak{c}, \mathfrak{d}, \mathfrak{e}, \mathfrak{f}$
- $\overline{a + b}, \underline{a + b}, \hat{a}, \tilde{a}, \bar{a}, \vec{a}$
    - $\sin x, \cos x, \tan x, \csc x, \sec x, \cot x$
    - $\sinh x, \cosh x, \tanh x, \coth x$
    - $\mathbf{A} = \begin{pmatrix} a_{11} & a_{12} & \cdots & a_{1n} \\ a_{21} & a_{22} & \cdots & a_{2n} \\ \vdots & \vdots & \ddots & \vdots \\ a_{m1} & a_{m2} & \cdots & a_{mn} \end{pmatrix}$
- $\arcsin x, \arccos x, \arctan x$

$\log x, \ln x$

$\lim_{n \to \infty} a_n = L$

$\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$

$\prod_{i=1}^{n} i = n!$

$\int_{a}^{b} f(x) \, dx$

$\iint_{D} f(x,y) \, dx \, dy$

$\iiint_{D} f(x,y,z) \, dx \, dy \, dz$

$\oint_{\partial D} f(z) \, dz$

$\sum_{i=0}^{\infty} x^i = \frac{1}{1-x} \quad \text{for} \ |x| < 1$

$f'(x), f''(x), \frac{df}{dx}, \frac{d^2 f}{dx^2}, \frac{\partial f}{\partial x}, \frac{\partial^2 f}{\partial x^2}$

$\nabla \cdot \mathbf{E} = \frac{\rho}{\epsilon_0}, \quad \nabla \times \mathbf{E} = -\frac{\partial \mathbf{B}}{\partial t}$

$\begin{aligned} \hat{H} \Psi &= E \Psi \\ \text{where} \ \hat{H} &= -\frac{\hbar^2}{2m} \nabla^2 + V(\mathbf{r}) \end{aligned}$

### Display mode

$$\alpha, \beta, \gamma, \delta, \epsilon, \zeta, \eta, \theta, \iota, \kappa, \lambda, \mu, \nu, \xi, \pi, \rho, \sigma, \tau, \upsilon, \phi, \chi, \psi, \omega$$

$$A = \begin{pmatrix} a & b \\ c & d \end{pmatrix}$$
$$B = \begin{bmatrix} e & f \\ g & h \end{bmatrix}$$
$$C = \begin{matrix} i & j \\ k & l \end{matrix}$$

$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$

$$\int_{a}^{b} f(x) \, dx = F(b) - F(a)$$

$$e^{i\pi} + 1 = 0$$

$$\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}$$

$$\lim_{x \to 0} \frac{\sin x}{x} = 1$$

$$\binom{n}{k} = \frac{n!}{k!(n-k)!}$$

$$\begin{aligned} a + b &= c \\ d - e &= f \\ g \times h &= i \\ j \div k &= l \end{aligned}$$

$$\begin{cases} ax + by = c \\ dx + ey = f \end{cases}$$

$$\begin{array}{c|c} a & b \\ \hline c & d \end{array}$$

$$\mathbb{R}, \mathbb{Z}, \mathbb{N}, \mathbb{Q}, \mathbb{C}$$

$$\mathcal{A}, \mathcal{B}, \mathcal{C}, \mathcal{D}, \mathcal{E}, \mathcal{F}, \mathcal{G}$$

$$\mathfrak{a}, \mathfrak{b}, \mathfrak{c}, \mathfrak{d}, \mathfrak{e}, \mathfrak{f}$$

$$\begin{split} a + b &= c \\ d - e &= f \end{split}$$

$$\overline{a + b}, \underline{a + b}, \hat{a}, \tilde{a}, \bar{a}, \vec{a}$$

$$\sin x, \cos x, \tan x, \csc x, \sec x, \cot x$$

$$\sinh x, \cosh x, \tanh x, \coth x$$

$$\arcsin x, \arccos x, \arctan x$$

$$\log x, \ln x$$

$$\lim_{n \to \infty} a_n = L$$

$$\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$$

$$\prod_{i=1}^{n} i = n!$$

$$\int_{a}^{b} f(x) \, dx$$

$$\iint_{D} f(x,y) \, dx \, dy$$

$$\iiint_{D} f(x,y,z) \, dx \, dy \, dz$$

$$\oint_{\partial D} f(z) \, dz$$

$$\sum_{i=0}^{\infty} x^i = \frac{1}{1-x} \quad \text{for} \ |x| < 1$$
![](/img/placeholder/ph1.png)
![](/img/placeholder/ph2.png)
![](/img/placeholder/ph3.png)
$$f'(x), f''(x), \frac{df}{dx}, \frac{d^2 f}{dx^2}, \frac{\partial f}{\partial x}, \frac{\partial^2 f}{\partial x^2}$$
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Suspendisse ultrices gravida dictum fusce. Urna neque viverra justo nec ultrices. Ornare massa eget egestas purus viverra accumsan. Pellentesque elit eget gravida cum sociis. Leo vel orci porta non pulvinar neque laoreet. Aliquam etiam erat velit scelerisque in dictum non consectetur. Quis imperdiet massa tincidunt nunc pulvinar sapien et. Quis commodo odio aenean sed adipiscing diam donec. Commodo elit at imperdiet dui. Iaculis nunc sed augue lacus viverra. Risus feugiat in ante metus.
$$\nabla \cdot \mathbf{E} = \frac{\rho}{\epsilon_0}, \quad \nabla \times \mathbf{E} = -\frac{\partial \mathbf{B}}{\partial t}$$

$$\mathbf{A} = \begin{pmatrix} a_{11} & a_{12} & \cdots & a_{1n} \\ a_{21} & a_{22} & \cdots & a_{2n} \\ \vdots & \vdots & \ddots & \vdots \\ a_{m1} & a_{m2} & \cdots & a_{mn} \end{pmatrix}$$

$$\begin{aligned} \hat{H} \Psi &= E \Psi \\ \text{where} \ \hat{H} &= -\frac{\hbar^2}{2m} \nabla^2 + V(\mathbf{r}) \end{aligned}$$