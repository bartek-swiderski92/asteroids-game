/** @format */
import $svg from '../modules/svg.js';
import $helpers from '../modules/helpers.js';
const gameNode = document.querySelector('#game');

export class Game {
    constructor(options) {
        this.guide = options.guide;
    }

    drawGrid() {
        $svg.drawGrid(gameNode, this);
    }

    switchGrid() {
        const targetElement = document.querySelector(`#grid`);
        this.guide = !this.guide;
        targetElement.style.display = this.guide ? 'inline' : 'none';
    }
}
export class Mass {
    constructor(options) {
        options = $helpers.assignDefaultValues('massClass', options);
        //Appearance
        this.lineWidth = options.lineWidth;
        this.stroke = options.stroke;
        this.fill = options.fill;
        this.guide = options.guide;

        this.x = options.x;
        this.y = options.y;
        this.mass = options.mass;
        this.radius = options.radius;
        this.angle = options.angle;
        this.xSpeed = options.xSpeed;
        this.ySpeed = options.ySpeed;
        this.rotationSpeed = options.rotationSpeed;
        this.rotateValue = options.rotateValue;
    }

    update(elapsed) {
        this.x += this.xSpeed * elapsed;
        this.y += this.ySpeed * elapsed;
        this.rotateValue += this.rotationSpeed * elapsed;
        this.rotateValue %= 2 * Math.PI;

        if (this.x - this.radius > gameNode.clientWidth) {
            this.x = -this.radius;
        }
        if (this.x + this.radius < 0) {
            this.x = gameNode.clientWidth + this.radius;
        }
        if (this.y - this.radius > gameNode.clientHeight) {
            this.y = -this.radius;
        }
        if (this.y + this.radius < 0) {
            this.y = gameNode.clientHeight + this.radius;
        }
        this.animateElement();
    }

    push(angle, force, elapsed) {
        this.xSpeed += (elapsed * (Math.cos(angle) * force)) / this.mass;
        this.ySpeed += (elapsed * (Math.sin(angle) * force)) / this.mass;
    }

    twist(force, elapsed) {
        this.rotationSpeed += (elapsed * force) / this.mass;
    }

    speed() {
        return Math.sqrt(Math.pow(this.xSpeed, 2) + Math.pow(this.ySpeed, 2));
    }

    movementAngle() {
        return Math.atan2(this.ySpeed, this.xSpeed);
    }

    animateElement() {
        const targetElement = document.querySelector(`#${this.groupId || this.id}`);
        targetElement.setAttribute('style', `transform: translate(${this.x}px, ${this.y}px) rotate(${this.rotateValue}rad)`);
    }
}
export class Ship extends Mass {
    constructor(options = {}) {
        options = $helpers.assignDefaultValues('shipClass', options, gameNode);
        super(options);

        this.id = options.id;
        this.groupId = options.groupId;
        this.initialX = options.initialX;
        this.initialY = options.initialY;

        //Appearance
        this.curve1 = options.curve1;
        this.curve2 = options.curve2;

        //State
        this.loaded = false;
        this.weaponPower = options.weaponPower;
        this.weaponReloadTime = options.weaponReloadTime;
        this.timeUntilReloaded = this.weaponReloadTime;
        this.thrusterPower = options.thrusterPower;
        this.steeringPower = options.thrusterPower / 20;
        this.thrusterOn = false;
        this.rightThrusterOn = false;
        this.leftThrusterOn = false;
    }

    draw(asteroids) {
        $svg.drawShip(asteroids, this);
    }

    init() {
        this.animateElement();
    }

    switchThruster() {
        const targetElement = document.querySelector(`#ship-flame`);
        targetElement.style.display = this.thrusterOn ? 'inline' : 'none';
    }
    update(elapsed) {
        this.loaded = this.timeUntilReloaded === 0;
        if (!this.loaded) {
            this.timeUntilReloaded -= Math.min(elapsed, this.timeUntilReloaded);
        }
        this.switchThruster();
        this.push(this.rotateValue, this.thrusterOn * this.thrusterPower, elapsed);
        this.twist((this.rightThrusterOn - this.leftThrusterOn) * this.steeringPower, elapsed);
        Mass.prototype.update.apply(this, arguments);
    }

    projectile(gameNode, projectileCount, elapsed) {
        let projectile = new Projectile(this, projectileCount);
        projectile.push(this.rotateValue, this.weaponPower, elapsed);
        projectile.draw(gameNode);
        this.loaded = false;
        this.timeUntilReloaded = this.weaponReloadTime;
        return projectile;
    }

    switchGuide() {
        const targetElement = document.querySelector(`#ship-guide`);
        this.guide = !this.guide;
        targetElement.style.display = this.guide ? 'inline' : 'none';
    }
}

export class Asteroid extends Mass {
    constructor(id, options = {}) {
        options.id = id;
        options = $helpers.assignDefaultValues('asteroidClass', options, gameNode);
        super(options);
        this.id = id;
        this.groupId = options.groupId;
        this.class = options.class;
        this.circumference = 2 * Math.PI * this.radius;
        this.segments = Math.min(25, Math.max(5, Math.ceil(this.circumference / 15)));
        this.noise = options.noise;
        this.shape = [];
        for (let i = 0; i < this.segments; i++) {
            this.shape.push(2 * Math.random() - 0.5);
        }
    }

    draw(gameNode) {
        $svg.drawAsteroid(gameNode, this);
    }

    init() {
        this.animateElement();
    }

    switchGuide() {
        const targetElement = document.querySelector(`#asteroid-guide-group-tag-${this.id}`);
        this.guide = !this.guide;
        targetElement.style.display = this.guide ? 'inline' : 'none';
    }
}

export class Projectile extends Mass {
    constructor(ship, projectileCount, options = {}) {
        console.log(ship);
        options = $helpers.assignDefaultValues('projectile', options, gameNode);
        super(options);
        this.id = `projectile-${projectileCount}`;
        this.x = ship.x - Math.cos(Math.PI - ship.rotateValue) * ship.radius;
        this.y = ship.y + Math.sin(Math.PI - ship.rotateValue) * ship.radius;
        this.lifetime = options.lifetime;
        this.life = options.life;
        this.xSpeed = ship.xSpeed;
        this.ySpeed = ship.ySpeed;
        console.log(Math.cos(ship.rotateValue) * ship.radius * ship.x + ship.x);
    }

    draw(gameNode) {
        $svg.drawProjectile(gameNode, this);
    }

    update(elapsed, c) {
        this.life -= elapsed / this.lifetime;
        Mass.prototype.update.apply(this, arguments);
    }

    destroy(gameNode) {
        let projectileNode = gameNode.querySelector(`#${this.id}`);
        projectileNode.remove();
    }
}
