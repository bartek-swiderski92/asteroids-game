/** @format */
import $svg from '../modules/svg.js';
import $helpers from '../modules/helpers.js';
const gameNode = document.querySelector('#game');

export class Game {
    constructor(options) {
        this.guide = options.guide;
        this.drawGrid();
        this.ship = new Ship({guide: this.guide});
        this.projectileCount = 0;
        this.projectiles = [];
        this.asteroids = [];
        this.asteroidStartCount = options.asteroidStartCount ?? 4;
        for (let i = 0; i < this.asteroidStartCount; i++) {
            this.asteroids.push(this.movingAsteroid(i));
        }
        window.requestAnimationFrame(this.frame.bind(this));
        this.gridElement = document.getElementById('grid');
        this.UI = options.UI ?? {};
        this.drawUI();
    }

    drawGrid() {
        $svg.drawGrid(gameNode, this);
    }

    drawUI() {
        $svg.drawUI(gameNode, this);
    }

    switchGuide() {
        const collisionLines = [...document.querySelectorAll('.collision-line')];
        this.guide = !this.guide;
        this.gridElement.setAttribute('display', this.guide ? 'inline' : 'none');
        this.ship.switchGuide();
        this.asteroids.forEach((asteroid) => asteroid.switchGuide());
        collisionLines.forEach((line) => line.remove());
    }

    drawCollisionLine(obj1, obj2) {
        const lineId = `${obj1.id}-${obj2.id}`;
        const lineElement = document.getElementById(lineId);
        let lineOptions = $helpers.assignDefaultValues('collisionLine', {id: lineId});
        $svg.drawCollisionLine(gameNode, lineElement, obj1, obj2, lineOptions);
    }

    pushAsteroid(asteroid, elapsed) {
        elapsed = elapsed || 0.015;
        asteroid.push(2 * Math.PI * Math.random(), asteroid.pushForce, elapsed);
        asteroid.twist(Math.random() * 0.5 * Math.PI * asteroid.pushForce * 0.02, elapsed);
    }

    movingAsteroid(index, elapsed) {
        let asteroid = new Asteroid(`asteroid-${index}`, {guide: this.guide});
        this.pushAsteroid(asteroid, elapsed);
        return asteroid;
    }

    frame(timestamp) {
        if (!this.previous) this.previous = timestamp;
        let elapsed = timestamp - this.previous;
        this.update(elapsed / 1000);
        this.previous = timestamp;
        window.requestAnimationFrame(this.frame.bind(this));
    }

    update(elapsed) {
        this.ship.isCompromised = false;
        this.asteroids.forEach((asteroid) => {
            if (this.guide) {
                this.drawCollisionLine(asteroid, this.ship);
            }
            asteroid.isColliding = false;
            if (this.areColliding(asteroid, this.ship)) {
                this.ship.isCompromised = true;
                asteroid.isColliding = true;
            }
            asteroid.update(elapsed);
        }, this);
        this.ship.update(elapsed);
        this.projectiles.forEach((projectile, index, projectiles) => {
            projectile.update(elapsed);
            if (projectile.life <= 0) {
                projectile.destroy();
                projectiles.splice(index, 1);
            }
        }, this);
        if (this.ship.trigger && this.ship.loaded) {
            this.projectileCount++;
            this.projectiles.push(this.ship.projectile(this.projectileCount, elapsed));
        }
    }

    areColliding(obj1, obj2) {
        return this.distanceBetween(obj1, obj2) < obj1.radius + obj2.radius;
    }

    distanceBetween(obj1, obj2) {
        return Math.sqrt(Math.pow(obj1.x - obj2.x, 2) + Math.pow(obj1.y - obj2.y, 2));
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
        this.shipFlameOptions = options.shipFlameOptions;

        this.massElement = null;
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
        if (this.massElement == undefined) {
            this.massElement = document.querySelector(`#${this.groupId || this.id}`);
        }
        this.massElement.setAttribute('style', `transform: translate(${this.x}px, ${this.y}px) rotate(${this.rotateValue}rad)`);
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
        this.steeringPower = this.thrusterPower / 20;
        this.thrusterOn = false;
        this.rightThrusterOn = false;
        this.leftThrusterOn = false;
        this.isCompromised = false;
        this.maxHealth = options.maxHealth;
        this.health = this.maxHealth;

        $svg.drawShip(gameNode, this);
        this.animateElement();
        this.groupTagElement = document.getElementById(this.shipGroupOptions.id);
        this.guideGroupTagElement = document.getElementById(this.shipGuideGroupOptions.id);
        this.guideCircleElement = this.guideGroupTagElement.querySelector('circle');
        this.flameElement = document.getElementById(this.shipFlameOptions.id);
    }

    switchThruster() {
        this.flameElement.setAttribute('display', this.thrusterOn ? 'inline' : 'none');
    }

    update(elapsed) {
        this.loaded = this.timeUntilReloaded === 0;
        if (!this.loaded) {
            this.timeUntilReloaded -= Math.min(elapsed, this.timeUntilReloaded);
        }
        if (this.guide) {
            if (this.isCompromised) {
                this.guideCircleElement.setAttribute('stroke', this.shipGuideOptions.collisionStroke);
            } else {
                this.guideCircleElement.setAttribute('stroke', this.shipGuideOptions.stroke);
            }
        }
        this.switchThruster();
        this.push(this.rotateValue, this.thrusterOn * this.thrusterPower, elapsed);
        this.twist((this.rightThrusterOn - this.leftThrusterOn) * this.steeringPower, elapsed);
        if (this.isCompromised) {
            this.health -= Math.min(elapsed, this.health);
        }
        Mass.prototype.update.apply(this, arguments);
    }

    projectile(projectileCount, elapsed) {
        let projectile = new Projectile(`projectile-${projectileCount}`, this);
        projectile.push(this.rotateValue, this.weaponPower, elapsed);
        projectile.draw();
        this.loaded = false;
        this.timeUntilReloaded = this.weaponReloadTime;
        return projectile;
    }

    switchGuide() {
        this.guide = !this.guide;
        this.guideGroupTagElement.setAttribute('display', this.guide ? 'inline' : 'none');
    }
}

export class Asteroid extends Mass {
    constructor(id, options = {}) {
        options.id = id;
        options = $helpers.assignDefaultValues('asteroidClass', options, gameNode);
        super(options);
        this.id = id;
        this.groupId = options.groupId;
        this.isColliding = false;
        this.class = options.class;
        this.circumference = 2 * Math.PI * this.radius;
        this.segments = Math.min(25, Math.max(5, Math.ceil(this.circumference / 15)));
        this.noise = options.noise;
        this.shape = [];
        this.pushForce = options.pushForce;
        for (let i = 0; i < this.segments; i++) {
            this.shape.push(2 * Math.random() - 0.5);
        }
        this.draw();
        this.animateElement();
        this.guideElement = document.getElementById(this.guideOptions.id);
        this.guideCircleElement = this.guideElement.querySelector('circle');
    }

    draw() {
        $svg.drawAsteroid(gameNode, this);
    }

    update(elapsed) {
        if (this.guide) {
            if (this.isColliding) {
                this.guideCircleElement.setAttribute('stroke', this.guideOptions.collisionStroke);
            } else {
                this.guideCircleElement.setAttribute('stroke', this.guideOptions.stroke);
            }
        }
        Mass.prototype.update.apply(this, arguments);
    }

    switchGuide() {
        this.guide = !this.guide;
        this.guideElement.setAttribute('display', this.guide ? 'inline' : 'none');
    }
}

export class Projectile extends Mass {
    constructor(id, ship, options = {}) {
        options = $helpers.assignDefaultValues('projectileClass', options, gameNode);
        super(options);
        this.id = id;
        this.x = ship.x - Math.cos(Math.PI - ship.rotateValue) * ship.radius;
        this.y = ship.y + Math.sin(Math.PI - ship.rotateValue) * ship.radius;
        this.lifetime = options.lifetime;
        this.life = options.life;
        this.xSpeed = ship.xSpeed;
        this.ySpeed = ship.ySpeed;
    }

    draw() {
        $svg.drawProjectile(gameNode, this);
    }

    update(elapsed) {
        this.life -= elapsed / this.lifetime;
        Mass.prototype.update.apply(this, arguments);
    }

    destroy() {
        gameNode.getElementById(this.id).remove();
    }
}
