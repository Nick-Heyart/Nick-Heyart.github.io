let currentFrames = 0; //initalize variables
let selector = 0;
let scenes = 4;
let sMovedX = 0;
let sMovedY = 0;
let dX;
let dY;
let smooth = 0.2;


function setup() {
	createCanvas(windowWidth, windowHeight); //set up canvas
	font = 'Lato';
}

function draw() {
	//debug display
	/*
	fill(255);
	text(currentFrames, 0, 20);
	text(selector, 0, 50);
	*/

	++currentFrames; // count how manny frames have been spent on the current scene

	if (currentFrames > 500) { //reset the scene frames counter and increment the scene selector
		currentFrames = 0;
		++selector;
	}

	if (selector > scenes) { //reset the scene selector
		selector = 0;
	}

	if (selector === 0) { //draws squiggly lines that respond to your cursor
		squiggles();
		bigText('Consistency');
	}

	if (selector === 1) { //draws an arc that appears to want to eat your mouse
		nom();
		translate(-width / 2, -height / 2);
		bigText('Coordination');
	}

	if (selector === 2) { //draws squares that get smaller when you mouse over them
		sea();
		bigText('Reactive');
	}

	if (selector === 3) { //fork of "unfolding" by Roni Kaufman
		prism();
		translate(-width / 2, -height / 2);
		bigText('Reliability');
	}

	if (selector === 4) { //fork of "unfolding" by Roni Kaufman
		segments();
		bigText('Efficiency');
	}
}

function squiggles() {
	background(50); //clear background
	for ( //set up curve offset

		let offset = windowWidth * -0.5; offset < windowWidth * 1.5; offset += 100

	) {

		var posx1 = windowWidth * (mouseX * -0.001) + offset; //define the curve points
		var posy1 = mouseY * -3 - (windowHeight * 0.5);
		var posx2 = offset + (mouseX - (windowWidth * 0.5)) * 0.1;
		var posy2 = 0;
		var posx3 = offset + (mouseX - (windowWidth * 0.5)) * 0.12;
		var posy3 = windowHeight;
		var posx4 = (windowWidth * (mouseX * -0.001) + offset) * -1;
		var posy4 = mouseY * -1 + (windowHeight * 1.2);

		noFill(); //actually draw a curve
		stroke(120);
		curve(posx1, posy1, posx2, posy2, posx3, posy3, posx4, posy4);
	}
}

function nom() {
	background(50); //clear background
	translate(width / 2, height / 2);
	//scale(0.1);

	let cMouseX = mouseX - (width / 2);
	let cMouseY = mouseY - (height / 2);

	let originX1 = 0; // there is probably a better way to do this
	let originY1 = width * 0.7;

	let originX2 = width * 0.7;
	let originY2 = 0;

	let originX3 = 0;
	let originY3 = -width * 0.7;

	let originX4 = width * -0.7;
	let originY4 = 0;

	let strengthCap = PI;

	let pointVector1 = getAngle(cMouseX, cMouseY, originX1, originY1);
	let pointStrength1 = map(getStrength(cMouseX, cMouseY, originX1, originY1) + 3, strengthCap, 10, strengthCap, 10, true);

	let pointVector2 = getAngle(cMouseX, cMouseY, originX2, originY2);
	let pointStrength2 = map(getStrength(cMouseX, cMouseY, originX2, originY2) + 3, strengthCap, 10, strengthCap, 10, true);

	let pointVector3 = getAngle(cMouseX, cMouseY, originX3, originY3);
	let pointStrength3 = map(getStrength(cMouseX, cMouseY, originX3, originY3) + 3, strengthCap, 10, strengthCap, 10, true);

	let pointVector4 = getAngle(cMouseX, cMouseY, originX4, originY4);
	let pointStrength4 = map(getStrength(cMouseX, cMouseY, originX4, originY4) + 3, strengthCap, 10, strengthCap, 10, true);


	noStroke();
	fill(80);

	arc(originX1, originY1, windowWidth * 1.4, windowWidth * 1.4, pointVector1 + pointStrength1, pointVector1 - pointStrength1, PIE);
	arc(originX2, originY2, windowWidth * 1.4, windowWidth * 1.4, pointVector2 + pointStrength2, pointVector2 - pointStrength2, PIE);
	arc(originX3, originY3, windowWidth * 1.4, windowWidth * 1.4, pointVector3 + pointStrength3, pointVector3 - pointStrength3, PIE);
	arc(originX4, originY4, windowWidth * 1.4, windowWidth * 1.4, pointVector4 + pointStrength4, pointVector4 - pointStrength4, PIE);


	stroke(120);
	noFill();

	arc(originX1, originY1, windowWidth * 1.4, windowWidth * 1.4, pointVector1 + pointStrength1, pointVector1 - pointStrength1, PIE);
	arc(originX2, originY2, windowWidth * 1.4, windowWidth * 1.4, pointVector2 + pointStrength2, pointVector2 - pointStrength2, PIE);
	arc(originX3, originY3, windowWidth * 1.4, windowWidth * 1.4, pointVector3 + pointStrength3, pointVector3 - pointStrength3, PIE);
	arc(originX4, originY4, windowWidth * 1.4, windowWidth * 1.4, pointVector4 + pointStrength4, pointVector4 - pointStrength4, PIE);
}

function getAngle(X1, Y1, X2, Y2) {
	return Math.atan2(Y2 - Y1, X2 - X1);
}

function getStrength(X1, Y1, X2, Y2) {
	return (dist(X1, Y1, X2, Y2) * 0.0005);
}

function sea() {
	let originX = 0;
	let originY = 0;
	let quadSize = 50
	let quadSpace = 110

	background(50);
	fill(80);
	stroke(100);

	for (; originY < (windowHeight + quadSize); originY += quadSpace) {
		for (; originX < (windowWidth + quadSize); originX += quadSpace) {
			quad(
				originX + quadWobble(originX, quadSize, mouseX), originY + quadWobble(originY, quadSize, mouseY),
				originX - quadWobble(originX, quadSize, mouseX), originY + quadWobble(originY, quadSize, mouseY),
				originX - quadWobble(originX, quadSize, mouseX), originY - quadWobble(originY, quadSize, mouseY),
				originX + quadWobble(originX, quadSize, mouseX), originY - quadWobble(originY, quadSize, mouseY),
			)
		}
		originX = 0;
	}
}

function quadWobble(origin, size, mouse) { //sub-routine for sea function
	var unClamped = abs(origin - mouse) * 0.1;
	if (unClamped > size) {
		return size;
	} else {
		return unClamped;
	}
}

function prism() {
	// partially yoinked from Roni Kaufman
	// https://ronikaufman.github.io/

	background(50);
	translate(width / 2, height / 2);
	strokeWeight(1);
	stroke(120);
	noFill();

	const N_FRAMES = 80;
	let n = 100;
	let r = windowWidth * 2;

	let xA = r * cos(3 * PI / 2);
	let yA = r * sin(3 * PI / 2);
	let xB = r * cos(3 * PI / 2 - TWO_PI / 3);
	let yB = r * sin(3 * PI / 2 - TWO_PI / 3);
	let xC = r * cos(3 * PI / 2 - 2 * TWO_PI / 3);
	let yC = r * sin(3 * PI / 2 - 2 * TWO_PI / 3);

	let xAB = xA / 2 + xB / 2;
	let yAB = yA / 2 + yB / 2;
	let xAC = xA / 2 + xC / 2;
	let yAC = yA / 2 + yC / 2;
	let xBC = xB / 2 + xC / 2;
	let yBC = yB / 2 + yC / 2;

	triangle(xA, yA, xB, yB, xC, yC);
	line(xAB, yAB, 0, 0);
	line(xBC, yBC, 0, 0);
	line(xAC, yAC, 0, 0);

	let t = (dist(mouseX, mouseY, width / 2, height / 2) * 0.5 % N_FRAMES) / N_FRAMES;
	for (let i = 0; i < n; i++) {
		let x = map(i + t, 0, n, 0, xA);
		let y = map(i + t, 0, n, 0, yA);
		line(xAB, yAB, x, y);
		line(x, y, xAC, yAC);

		x = map(i + t, 0, n, 0, xB);
		y = map(i + t, 0, n, 0, yB);
		line(xAB, yAB, x, y);
		line(x, y, xBC, yBC);

		x = map(i + t, 0, n, 0, xC);
		y = map(i + t, 0, n, 0, yC);
		line(xBC, yBC, x, y);
		line(x, y, xAC, yAC);
	}
}

function segments() {
	background(50);
	let lineCount = 15;
	let lineSpace = 1;
	let mouseInfluence = 1;
	let lineSpread = 10;

	let currentLine = lineCount;
	stroke(120);
	noFill();
	strokeWeight(1);
	strokeCap(SQUARE);
	for (; currentLine > 0; currentLine--) {
		let curveY = height / 2 + currentLine * lineSpace - (lineCount * lineSpace) / 2;
		let spreadY = -mouseY * mouseInfluence - (currentLine * lineSpace - (lineCount * lineSpace) / 2) * lineSpread;

		let X1 = 0;
		let Y1 = curveY;
		let X2 = mouseX;
		let Y2 = -spreadY;
		let X3 = mouseX;
		let Y3 = -spreadY;
		let X4 = width;
		let Y4 = curveY;

		let curveLength = cubicBezierLength(X1, Y1, X2, Y2, X3, Y3, X4, Y4, 10);
		let dashLength = 40;

		drawingContext.lineDashOffset = -curveLength / 2 - mouseX + width / 2 + dashLength / 2;
		drawingContext.setLineDash([dashLength]);
		bezier(X1, Y1, X2, Y2, X3, Y3, X4, Y4);
	}
	drawingContext.setLineDash([]);
}

function cubicBezierLength(Ax, Ay, Bx, By, Cx, Cy, Dx, Dy, sampleCount) {
	var ptCount = sampleCount || 40;
	var totDist = 0;
	var lastX = Ax;
	var lastY = Ay;
	var dx, dy;
	for (var i = 1; i < ptCount; i++) {
		var pt = cubicQxy(i / ptCount, Ax, Ay, Bx, By, Cx, Cy, Dx, Dy);
		dx = pt.x - lastX;
		dy = pt.y - lastY;
		totDist += Math.sqrt(dx * dx + dy * dy);
		lastX = pt.x;
		lastY = pt.y;
	}
	dx = Dx - lastX;
	dy = Dy - lastY;
	totDist += Math.sqrt(dx * dx + dy * dy);
	return (parseInt(totDist));
}

function cubicQxy(t, ax, ay, bx, by, cx, cy, dx, dy) {
	ax += (bx - ax) * t;
	bx += (cx - bx) * t;
	cx += (dx - cx) * t;
	ax += (bx - ax) * t;
	bx += (cx - bx) * t;
	ay += (by - ay) * t;
	by += (cy - by) * t;
	cy += (dy - cy) * t;
	ay += (by - ay) * t;
	by += (cy - by) * t;
	return ({
		x: ax + (bx - ax) * t,
		y: ay + (by - ay) * t
	});
}

function bigText(t) {
	let swirls = 100;
	let swirlIndex = 95;
	let rotation = -sMovedX * 0.0001;

	push();
	translate(width / 2, height / 2);
	rotate(rotation);
	translate(-width / 2, -height / 2);

	dX = movedX - sMovedX;
	dY = movedY - sMovedY;

	sMovedX += dX * smooth;
	sMovedY += dY * smooth;

	stroke(20);
	noFill();
	strokeWeight(1);
	textFont(font, height / 4);
	textAlign(CENTER, CENTER);
	blendMode(ADD);

	for (; swirlIndex < swirls; swirlIndex++) {
		translate(width / 2, height / 2);
		rotate(-rotation * map(-swirlIndex, 0, swirls, 1, 0));
		translate(-width / 2, -height / 2);
		text(t, width / 2, height / 2);
	}

	fill(100);
	text(t, width / 2, height / 2);
	pop();
}
