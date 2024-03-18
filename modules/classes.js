/** @format */
import $svg from '../modules/svg.js';
import $helpers from '../modules/helpers.js';
const gameNode = document.querySelector('#game');

export class Game {
    constructor(options = {}) {
        this.guide = options.guide;
        this.drawGrid();
        this.ship = new Ship(options);
        this.projectileCount = 0;
        this.asteroidCount = 0;
        this.projectiles = [];
        this.asteroids = [];
        this.asteroidStartCount = options.asteroidStartCount ?? 4;
        for (let i = 0; i < this.asteroidStartCount; i++) {
            this.asteroids.push(this.movingAsteroid(i));
            this.asteroidCount++;
        }
        window.requestAnimationFrame(this.frame.bind(this));
        this.gridElement = document.getElementById('grid');

        this.massDestroyed = 500;
        this.score = 0;

        this.populateUiSettings(options);
        this.drawUI();
        this.currentFps = 0;
        this.fpsCounterElement = document.getElementById('current-fps');
    }

    drawGrid() {
        $svg.drawGrid(gameNode, this);
    }

    populateUiSettings(options) {
        this.UI = options.UI ?? {};

        this.UI.hpBar = this.UI.hpBar ?? {};
        const hpNestedOptions = ['groupHpTag', 'hpText', 'maxHpBar', 'currentHpBar'];
        hpNestedOptions.forEach((optionObject) => {
            this.UI.hpBar[optionObject] = $helpers.assignDefaultValues(optionObject, this.UI.hpBar[optionObject], gameNode, this.UI.hpBar);
        });

        this.UI.score = this.UI.score ?? {};
        const scoreNestedOptions = ['groupScoreTag', 'scoreLabel', 'currentScore'];
        scoreNestedOptions.forEach((optionObject) => {
            this.UI.score[optionObject] = $helpers.assignDefaultValues(optionObject, this.UI.score[optionObject], gameNode, this.UI.score);
        });

        this.UI.fps = this.UI.fps ?? {};
        const fpsNestedOptions = ['groupFpsTag', 'fpsLabel', 'currentFps'];
        fpsNestedOptions.forEach((optionObject) => {
            this.UI.fps[optionObject] = $helpers.assignDefaultValues(optionObject, this.UI.fps[optionObject], gameNode, this.UI.fps);
        });
    }

    drawUI() {
        $svg.drawUI(this.UI, gameNode);
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

    updateFps(fps) {
        if (fps !== this.currentFps) {
            this.currentFps = fps;
            this.fpsCounterElement.innerHTML = parseInt(fps);
        }
    }

    frame(timestamp) {
        if (!this.previous) this.previous = timestamp;
        let elapsed = timestamp - this.previous;
        this.updateFps(1000 / elapsed);
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

        this.projectiles.forEach((projectile) => {
            projectile.update(elapsed);
            if (projectile.life <= 0 && projectile.destroyed === false) {
                projectile.destroy(this.projectiles);
            } else {
                this.asteroids.forEach((asteroid) => {
                    //TODO Add collision lines between projectiles and asteroids (needs refactor due to multiple ids)
                    if (this.areColliding(asteroid, projectile) && projectile.destroyed === false && asteroid.destroyed === false) {
                        projectile.destroy(this.projectiles);
                        this.splitAsteroid(asteroid, elapsed);
                    }
                }, this);
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

    mountAsteroidChild(asteroid, childMass, elapsed) {
        if (childMass < this.massDestroyed) {
            this.updateScore(childMass);
        } else {
            const child = asteroid.createChild(this, childMass);
            this.pushAsteroid(child, elapsed);
            this.asteroids.push(child);
        }
    }

    splitAsteroid(asteroid, elapsed) {
        asteroid.mass -= this.massDestroyed;
        this.updateScore(this.massDestroyed);

        const split = 0.25 + 0.5 * Math.random();

        this.mountAsteroidChild(asteroid, split * asteroid.mass, elapsed);
        this.mountAsteroidChild(asteroid, (1 - split) * asteroid.mass, elapsed);

        if (asteroid.destroyed === false) {
            asteroid.destroy(this.asteroids);
        }
    }
    updateScore(score) {
        let result = '';
        this.score += score;
        let currentScoreNode = document.getElementById('current-score');
        let stringifiedValue = Math.round(this.score).toString();
        let characterDifference = this.UI.score.currentScore.numberOfDigits - stringifiedValue.length;
        for (let i = 0; i < characterDifference; i++) {
            result += '0';
        }
        result += stringifiedValue;
        currentScoreNode.innerHTML = result;
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
        //TODO Add flag to improve performance
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
            $svg.transformHealthBar(this);
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

        this.destroyed = false;
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

    createChild(gameInstance, mass) {
        const options = {
            x: this.x,
            y: this.y,
            mass: mass,
            xSpeed: this.xSpeed,
            ySpeed: this.ySpeed,
            rotationSpeed: this.rotationSpeed,
            guide: gameInstance.guide
        };

        //TODO is it okay to create a new instance here?
        const asteroid = new Asteroid(`asteroid-${gameInstance.asteroidCount}`, options);
        gameInstance.asteroidCount++;
        return asteroid;
    }

    destroy(asteroidsArray) {
        this.destroyed = true;
        const asteroidsNode = gameNode.getElementById(`group-tag-${this.id}`);
        const collisionLine = gameNode.getElementById(`${this.id}-ship`);
        if (asteroidsNode != undefined) {
            asteroidsNode.remove();
        }
        if (collisionLine != undefined) {
            collisionLine.remove();
        }
        const asteroidIndex = asteroidsArray.findIndex((asteroid) => asteroid.id === this.id);
        asteroidsArray.splice(asteroidIndex, 1);
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

        this.destroyed = false;
    }

    draw() {
        $svg.drawProjectile(gameNode, this);
    }

    update(elapsed) {
        this.life -= elapsed / this.lifetime;
        Mass.prototype.update.apply(this, arguments);
    }

    destroy(projectilesArray) {
        this.destroyed = true;
        const projectileNode = gameNode.getElementById(this.id);
        if (projectileNode != undefined) {
            projectileNode.remove();
        }
        const projectileIndex = projectilesArray.findIndex((projectile) => projectile.id === this.id);
        projectilesArray.splice(projectileIndex, 1);
    }
}
