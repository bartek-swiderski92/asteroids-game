/** @format */
import $svg from '../modules/svg.js';
import $helpers from '../modules/helpers.js';
const gameNode = document.querySelector('#game');
const textOverlayNode = document.querySelector('#text-overlay');
const pauseGameNode = document.querySelector('#game-paused');

class AsteroidsAudio extends Audio {
    stop() {
        this.pause();
        this.currentTime = 0;
    }
}

export class Game {
    constructor(options = {}) {
        this.options = options;
        this.guide = false;
        this.drawGrid();
        this.projectileCount = 0;
        this.asteroidCount = 0;
        this.asteroidStartCount = options.asteroidStartCount ?? 4;
        this.massDestroyed = 500;
        this.massDestroyed = 500;
        window.requestAnimationFrame(this.frame.bind(this));
        this.gridElement = document.getElementById('grid-g-tag');
        this.populateUiSettings();
        this.drawUI();

        //sound
        this.setSoundEffects();
        this.soundTrackProgress = 0;
        this.playSoundtrackTempo = 1.2;
        this.lastPlayedSound = undefined;

        this.safeZonesVisible = false;
        this.resetGame();

        this.drawSafeZone();
        this.gameOverSettings = options.gameOverSettings ?? {};
        this.currentFps = 0;
        this.fpsCounterElement = document.getElementById('current-fps');
        this.buttonPressed = null;

        this.isGamePaused = false;
    }

    drawGrid() {
        $svg.drawGrid(gameNode, this);
    }

    drawSafeZone() {
        let safeZone = $svg.drawSafeZone(this);
        let safeZoneTag = document.getElementById('safe-zone-g-tag');

        this.safeZoneNode = safeZone;
        safeZoneTag.appendChild(safeZone);
    }

    populateUiSettings() {
        this.UI = this.options.UI ?? {};

        this.UI.hpBar = this.UI.hpBar ?? {};
        const hpNestedOptions = ['groupHpTag', 'hpText', 'maxHpBar', 'currentHpBar', 'currentHpText'];
        hpNestedOptions.forEach((optionObject) => {
            this.UI.hpBar[optionObject] = $helpers.assignDefaultValues(optionObject, this.UI.hpBar[optionObject], gameNode, this.UI.hpBar);
        });

        this.UI.level = this.UI.level ?? {};
        const levelNestedOptions = ['currentLevel'];
        levelNestedOptions.forEach((optionObject) => {
            this.UI.level[optionObject] = $helpers.assignDefaultValues(optionObject, this.UI.level[optionObject], gameNode, this.UI.level);
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

    setSoundEffects() {
        this.soundEffects = {
            fire1: new AsteroidsAudio('sfx/fire.wav'),
            fire2: new AsteroidsAudio('sfx/sfire.wav'),
            explodeShip: new AsteroidsAudio('sfx/explode1.wav'),
            explodeAsteroid1: new AsteroidsAudio('sfx/explode2.wav'),
            explodeAsteroid2: new AsteroidsAudio('sfx/explode3.wav'),
            collision: new AsteroidsAudio('sfx/life.wav'),
            thrust: new AsteroidsAudio('sfx/thrust.wav'),
            thumphi: new AsteroidsAudio('sfx/thumphi.wav'),
            thumplo: new AsteroidsAudio('sfx/thumplo.wav')
        };

        this.soundEffects.fire1.volume = 0.3;
        this.soundEffects.fire2.volume = 0.3;
        this.soundEffects.collision.volume = 0.3;
        this.soundEffects.thumphi.volume = 0.5;
        this.soundEffects.thumplo.volume = 0.5;
    }

    switchGuide() {
        const collisionLines = [...document.querySelectorAll('.collision-line')];
        this.guide = !this.guide;
        this.gridElement.setAttribute('display', this.guide ? 'inline' : 'none');
        this.ship.switchGuide(this.guide);
        this.asteroidMap.forEach((asteroid) => asteroid.switchGuide(this.guide));
        collisionLines.forEach((line) => line.remove());
    }

    switchSafeZone() {
        this.safeZonesVisible = !this.safeZonesVisible;
        if (this.isGamePaused) this.transformSafeZone();
        this.safeZoneNode.setAttribute('display', this.safeZonesVisible ? 'inline' : 'none');
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

    createAsteroid(options = {}, elapsed) {
        options = $helpers.assignDefaultValues('asteroidClass', options, gameNode);
        options = this.assignAsteroidsCoordinates(options);

        const id = `asteroid-${this.asteroidCount++}`;
        const asteroid = new Asteroid(id, options);
        this.asteroidMap.set(id, asteroid);
        this.pushAsteroid(asteroid, elapsed);
    }

    assignAsteroidsCoordinates(asteroidOptions) {
        //TODO prevent asteroids spawning on the edge of the screen
        if (asteroidOptions.x != undefined && asteroidOptions.y != undefined) return asteroidOptions;
        let x = $helpers.getRandomNumber(0, gameNode.clientWidth);
        let y = $helpers.getRandomNumber(0, gameNode.clientWidth);

        const distanceX = Math.abs(x - this.ship.x);
        const distanceY = Math.abs(y - this.ship.y);
        const hypotenuse = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
        if (hypotenuse < this.safeSpawnRadius) {
            if (x < this.ship.x) {
                x -= this.safeSpawnRadius;
            } else {
                x += this.safeSpawnRadius;
            }
            if (y < this.ship.y) {
                y -= this.safeSpawnRadius;
            } else {
                y += this.safeSpawnRadius;
            }
        }

        asteroidOptions.x = x;
        asteroidOptions.y = y;
        return asteroidOptions;
    }

    updateFps(fps) {
        if (fps !== this.currentFps) {
            this.currentFps = fps;
            this.fpsCounterElement.innerHTML = isFinite(fps) ? parseInt(fps) : 0;
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

    playSoundtrack(elapsed) {
        this.soundTrackProgress += elapsed;
        if (this.soundTrackProgress >= this.playSoundtrackTempo) {
            this.soundTrackProgress = 0;
            if (this.lastPlayedSound === 'thumplo' || this.lastPlayedSound == undefined) {
                this.soundEffects.thumphi.play();
                this.lastPlayedSound = 'tumphi';
            } else {
                this.soundEffects.thumplo.play();
                this.lastPlayedSound = 'thumplo';
            }
        }
    }

    update(elapsed) {
        if (this.isGamePaused) {
            return;
        }
        this.ship.isCompromised = false;

        if (this.safeZonesVisible) {
            this.transformSafeZone();
        }

        if (this.asteroidMap.size === 0) {
            this.levelUp();
        }

        this.asteroidMap.forEach((asteroid) => {
            if (this.guide) {
                this.drawCollisionLine(asteroid, this.ship);
            }
            asteroid.isColliding = false;
            if (this.areColliding(asteroid, this.ship) && !this.ship.isUntouchable) {
                this.ship.isCompromised = true;

                asteroid.isColliding = true;
            }
            if (asteroid.destroyed && !asteroid.massElement.isConnected) {
                // stuck asteroid
                asteroid.destroy(this.asteroidMap, true);
            }
            asteroid.update(elapsed);
        }, this);
        if (!this.gameOver) {
            this.playSoundtrack(elapsed);

            if (this.ship.isCompromised) {
                this.soundEffects.collision.play();
            } else if (!this.soundEffects.collision.paused) {
                this.soundEffects.collision.stop();
            }

            if (this.ship.thrusterOn) {
                this.soundEffects.thrust.play();
            } else if (!this.soundEffects.thrust.paused) {
                this.soundEffects.thrust.stop();
            }
        }
        this.projectileMap.forEach((projectile) => {
            if (projectile.destroyed) {
                projectile.destroy(this.projectileMap, true);
            }

            projectile.update(elapsed);

            if (projectile.life <= 0 && projectile.destroyed === false) {
                projectile.destroy(this.projectileMap);
            } else {
                this.asteroidMap.forEach((asteroid) => {
                    if (this.areColliding(asteroid, projectile) && projectile.destroyed === false && asteroid.destroyed === false && asteroid.isUntouchable === false) {
                        projectile.destroy(this.projectileMap);
                        this.splitAsteroid(asteroid, elapsed);
                        if (this.playSoundtrackTempo > 0.2) {
                            this.playSoundtrackTempo = this.playSoundtrackTempo - Math.pow(this.asteroidStartCount + this.level, 2) / 2000;
                        }
                        const id = `${asteroid.id}-explosion`;
                        this.explosionMap.set(id, new Explosion(id, asteroid));
                    }
                }, this);
            }
        }, this);

        this.explosionMap.forEach((explosion) => {
            if (explosion.destroyed && !explosion.node.isConnected) {
                explosion.destroy(this.explosionMap, true);
            }

            explosion.update(elapsed);

            if (explosion.life <= 0 && explosion.destroyed === false) {
                explosion.destroy(this.explosionMap);
            }
        }, this);

        if (this.ship.health <= 0 && this.gameOver === false) {
            this.soundEffects.collision.stop();
            this.soundEffects.explodeShip.play();

            this.endGame();

            return;
        }
        this.ship.update(elapsed);
        if (this.ship.trigger && this.ship.loaded) {
            const projectileId = `projectile-${this.projectileCount++}`;
            $helpers.playRandomSound(this.soundEffects, ['fire1', 'fire2']);
            this.projectileMap.set(projectileId, this.ship.projectile(projectileId, elapsed));
        }
    }

    transformSafeZone() {
        this.safeZoneNode.setAttribute('transform', `translate(${this.ship.x}, ${this.ship.y})`);
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
            const childOptions = asteroid.createChild(this, childMass);
            this.createAsteroid(childOptions, elapsed);
        }
    }

    splitAsteroid(asteroid, elapsed) {
        asteroid.mass -= this.massDestroyed;

        $helpers.playRandomSound(this.soundEffects, ['explodeAsteroid1', 'explodeAsteroid2']);

        this.updateScore(this.massDestroyed);

        const split = 0.25 + 0.5 * Math.random();

        this.mountAsteroidChild(asteroid, split * asteroid.mass, elapsed);
        this.mountAsteroidChild(asteroid, (1 - split) * asteroid.mass, elapsed);

        if (asteroid.destroyed === false) {
            asteroid.destroy(this.asteroidMap);
        }
    }
    updateScore(score) {
        if (this.gameOver === false) {
            let result = '';
            this.score += score;
            let currentScoreNode = document.getElementById('current-score');
            let stringifiedValue = Math.round(this.score).toString();
            let characterDifference = this.UI.score.currentScore.numberOfDigits - stringifiedValue.length;
            for (let i = 0; i < characterDifference; i++) {
                result += '0';
            }
            result += stringifiedValue;
            if (currentScoreNode != undefined) {
                currentScoreNode.innerHTML = result;
            }
        }
    }
    endGame() {
        this.gameOver = true;
        this.ship.groupTagElement.remove();
        this.ship.thrusterOn = false;
        this.ship.leftThrusterOn = false;
        this.ship.rightThrusterOn = false;
        this.ship.retroOn = false;
        this.ship.trigger = false;
        this.ship.xSpeed = 0;
        this.ship.ySpeed = 0;
        this.ship.rotationSpeed = 0;
        $svg.displayGameOverMessage(this, textOverlayNode);
    }
    resetGame() {
        const svgClearArray = [...document.querySelectorAll('.asteroid-group-tag'), ...document.querySelectorAll('.collision-line'), ...document.querySelectorAll('.projectile'), document.querySelector('.message-group')];
        svgClearArray.forEach((node) => node?.remove());
        this.level = 1;
        this.shieldTimeout = 3000;
        this.displayLevelIndicator();
        this.gameOver = false;
        this.guide = false;
        this.gridElement.setAttribute('display', 'none');
        this.score = 0;
        this.updateScore(0);

        this.safeSpawnRadius = 100 + 69; // hardcoded ship radius and asteroid (they don't exist yet)

        this.ship = new Ship(this.options);
        this.ship.makeUntouchable(this.shieldTimeout);
        $svg.transformHealthBar(this.ship);

        this.projectileMap = new Map();
        this.asteroidMap = new Map();
        this.explosionMap = new Map();

        for (let i = 0; i < this.asteroidStartCount; i++) {
            this.createAsteroid();
        }
    }

    displayLevelIndicator() {
        $svg.displayLevelIndicator(this, textOverlayNode, this.shieldTimeout);
    }

    levelUp() {
        this.playSoundtrackTempo = 1.2;
        for (let i = 0; i < this.asteroidStartCount + this.level; i++) {
            this.createAsteroid();
        }
        this.level += 1;

        this.ship.makeUntouchable(this.shieldTimeout);
        this.displayLevelIndicator();
        this.ship.maxHealth += this.ship.maxHealthIncrease;
        this.ship.health = Math.min(this.ship.health + this.ship.maxHealthIncrease * 2, this.ship.maxHealth);
        $svg.transformHealthBar(this.ship);
    }

    pauseGame() {
        this.isGamePaused = true;
        this.ship.disableControls();
        pauseGameNode.classList.remove('hide');
    }

    resumeGame() {
        this.isGamePaused = false;
        pauseGameNode.classList.add('hide');
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

        this.isUntouchable = true;
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

    animateElement(firstFrame = false) {
        if (firstFrame) {
            this.isUntouchable = false;
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
        this.maxHealthIncrease = options.maxHealthIncrease;
        this.health = this.maxHealth;

        this.draw();
        this.animateElement(true);

        this.groupTagElement = document.getElementById(this.shipGroupOptions.id);
        this.guideGroupTagElement = document.getElementById(this.shipGuideGroupOptions.id);
        this.guideCircleElement = this.guideGroupTagElement.querySelector('circle');
        this.flameElement = document.getElementById(this.shipFlameOptions.id);
        $svg.transformHealthBar(this);
    }

    draw() {
        let shipGTag = document.getElementById('ship-g-tag');

        shipGTag.appendChild($svg.drawShip(gameNode, this));
        this.massElement = shipGTag.lastChild;
        this.shieldElement = document.getElementById(this.shipShieldOptions.id);
    }

    switchThruster(value) {
        this.flameElement.setAttribute('display', value ? 'inline' : 'none');
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
        this.push(this.rotateValue, this.thrusterOn * this.thrusterPower, elapsed);
        this.twist((this.rightThrusterOn - this.leftThrusterOn) * this.steeringPower, elapsed);
        if (this.isCompromised) {
            this.health -= Math.min(elapsed * 100, this.health);
            $svg.transformHealthBar(this);
        }
        Mass.prototype.update.apply(this, arguments);
    }

    projectile(id, elapsed) {
        let projectile = new Projectile(id, this);
        projectile.push(this.rotateValue, this.weaponPower, elapsed);
        projectile.draw();
        projectile.animateElement(true);
        this.loaded = false;
        this.timeUntilReloaded = this.weaponReloadTime;
        return projectile;
    }

    makeUntouchable(timeout) {
        this.isUntouchable = true;
        this.shieldElement.setAttribute('display', 'inline');

        setTimeout(() => {
            this.isUntouchable = false;
            this.shieldElement.setAttribute('display', 'none');
        }, timeout);
    }

    switchGuide(guide) {
        this.guide = guide;
        this.guideGroupTagElement.setAttribute('display', this.guide ? 'inline' : 'none');
    }

    disableControls() {
        this.thrusterOn = false;
        this.leftThrusterOn = false;
        this.rightThrusterOn = false;
        this.trigger = false;
        this.switchThruster(false);
    }
}

export class Asteroid extends Mass {
    constructor(id, options) {
        options.id = id;
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
        this.animateElement(true);
        this.guideElement = document.getElementById(this.guideOptions.id);
        this.guideCircleElement = this.guideElement.querySelector('circle');

        this.destroyed = false;
    }

    draw() {
        const asteroidsGTag = document.getElementById('asteroids-g-tag');
        const asteroidNode = $svg.drawAsteroid(gameNode, this);
        asteroidsGTag.appendChild(asteroidNode);
        this.massElement = asteroidsGTag.lastChild;
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

    switchGuide(guide) {
        this.guide = guide;
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

        return options;
    }

    destroy(asteroidMap, forceRemove = false) {
        if (forceRemove) {
            console.warn('Asteroid got stuck');
            let stuckNode = document.querySelector(`[id*="${this.id}"]`);
            stuckNode.remove();
        }
        this.destroyed = true;
        const collisionLine = gameNode.getElementById(`${this.id}-ship`);
        this.massElement.remove();
        if (collisionLine != undefined) {
            collisionLine.remove();
        }
        asteroidMap.delete(this.id);
    }
}

export class Projectile extends Mass {
    constructor(id, ship, options = {}) {
        options = $helpers.assignDefaultValues('projectileClass', options, gameNode);
        super(options);
        this.id = id;
        this.class = options.class;
        this.x = ship.x - Math.cos(Math.PI - ship.rotateValue) * ship.radius;
        this.y = ship.y + Math.sin(Math.PI - ship.rotateValue) * ship.radius;
        this.lifetime = options.lifetime;
        this.life = options.life;
        this.xSpeed = ship.xSpeed;
        this.ySpeed = ship.ySpeed;

        this.destroyed = false;
    }

    draw() {
        gameNode.appendChild($svg.drawProjectile(gameNode, this));
        this.massElement = gameNode.lastChild;
    }

    update(elapsed) {
        this.life -= elapsed / this.lifetime;
        Mass.prototype.update.apply(this, arguments);
    }

    destroy(projectileMap, forceDestroy) {
        if (forceDestroy) {
            console.warn('projectile got stuck');
            let stuckNode = document.querySelector(`#${this.id}`);
            stuckNode.remove();
        }
        this.destroyed = true;
        this.massElement.remove();
        projectileMap.delete(this.id);
    }
}

export class Explosion {
    constructor(id, asteroidInstance, options = {}) {
        options = options = $helpers.assignDefaultValues('explosionClass', options, gameNode, asteroidInstance);
        this.id = id;
        this.class = options.class;
        this.originX = asteroidInstance.x;
        this.originY = asteroidInstance.y;
        this.explosionElementRadius = Math.max(parseInt(asteroidInstance.radius / 120), 2);
        this.node = null;
        this.explosionNumber = Math.max(parseInt(asteroidInstance.radius / 4), 8);
        this.directionSlice = (Math.PI * 2) / this.explosionNumber;
        this.lifetime = 1.5;
        this.life = this.lifetime;
        this.destroyed = false;
        this.explosionDistance = 0;
        this.explosionArray = [];
        this.draw();
    }

    draw() {
        const explosionGTag = document.getElementById('explosions-g-tag');
        const explosionNode = $svg.drawExplosion(this);

        explosionGTag.appendChild(explosionNode);
        this.node = explosionGTag.lastChild;
        [...this.node.children].forEach((child, index) => {
            let childObject = {
                node: child,
                directionX: Math.sin(this.directionSlice * index) * $helpers.getRandomNumber(-0.5, 0.5),
                directionY: Math.cos(this.directionSlice * index) * $helpers.getRandomNumber(-0.5, 0.5)
            };
            this.explosionArray.push(childObject);
        });
    }

    update(elapsed) {
        this.life -= elapsed;
        this.animate(elapsed);
    }

    animate(elapsed) {
        this.explosionArray.forEach((explosion) => {
            let directionX = explosion.directionX * this.explosionDistance;
            let directionY = explosion.directionY * this.explosionDistance;
            explosion.node.setAttribute('style', `transform: translate(${directionX}px, ${directionY}px)`);
        });
        this.explosionDistance += elapsed * 35;
    }

    destroy(explosionMap, forceDestroy = false) {
        if (forceDestroy) {
            console.warn('Explosion got stuck');
            let stuckNode = document.querySelector(`#${this.id}`);
            stuckNode.remove();
        }
        this.node.remove();
        this.destroyed = true;
        explosionMap.delete(this.id);
    }
}
