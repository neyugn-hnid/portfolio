    document.addEventListener('DOMContentLoaded', function () {
      const backToTopButton = document.getElementById('backToTop');
      if (!backToTopButton) return;

      // Smooth scroll to top when clicked
      backToTopButton.addEventListener('click', function (e) {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    });

      const imageDiv = document.getElementById('floating-image');
      document.body.appendChild(imageDiv);
      imageDiv.style.display = 'block';
      const gameArea = document.querySelector('.container-meteor-game');

      if (gameArea) {
        gameArea.addEventListener('mouseenter', () => {
          document.body.classList.add('is-playing-game');
        });

        gameArea.addEventListener('mouseleave', () => {
          document.body.classList.remove('is-playing-game');
        });
      }

      const cursorState = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        tx: window.innerWidth / 2,
        ty: window.innerHeight / 2,
        lastSparkX: window.innerWidth / 2,
        lastSparkY: window.innerHeight / 2,
      };
      function animateCursor() {
        cursorState.x += (cursorState.tx - cursorState.x) * 0.18;
        cursorState.y += (cursorState.ty - cursorState.y) * 0.18;
        imageDiv.style.left = `${cursorState.x}px`;
        imageDiv.style.top = `${cursorState.y}px`;
        requestAnimationFrame(animateCursor);
      }

      function createCursorSpark(x, y, velocityX, velocityY) {
        const spark = document.createElement('span');
        const size = Math.random() * 8 + 5;
        const driftX = (-velocityX * 2.4) + (Math.random() - 0.5) * 70;
        const driftY = (-velocityY * 2.4) + (Math.random() - 0.5) * 70;

        spark.className = 'cursor-spark';
        spark.style.setProperty('--spark-x', `${x}px`);
        spark.style.setProperty('--spark-y', `${y}px`);
        spark.style.setProperty('--spark-dx', `${driftX}px`);
        spark.style.setProperty('--spark-dy', `${driftY}px`);
        spark.style.setProperty('--spark-size', `${size}px`);
        spark.style.setProperty('--spark-rotate', `${Math.random() * 360}deg`);
        document.body.appendChild(spark);
        spark.addEventListener('animationend', () => spark.remove(), { once: true });
      }

      document.addEventListener('mousemove', (event) => {
        const dx = event.clientX - cursorState.lastSparkX;
        const dy = event.clientY - cursorState.lastSparkY;
        const distance = Math.hypot(dx, dy);

        cursorState.tx = event.clientX;
        cursorState.ty = event.clientY;

        if (!document.body.classList.contains('is-playing-game') && distance > 18) {
          createCursorSpark(event.clientX, event.clientY, dx, dy);
          cursorState.lastSparkX = event.clientX;
          cursorState.lastSparkY = event.clientY;
        }
      });

      animateCursor();

      // Meteor Animation with Explosion Effect
      class MeteorAnimation {
        constructor(canvas) {
          this.canvas = canvas;
          this.ctx = canvas.getContext('2d');
          this.meteors = [];
          this.explosions = [];
          this.bullets = []; // Danh sách đạn
          this.meteorImages = []; // Store loaded Image objects
          this.mouseX = -1; // Lưu vị trí chuột
          this.mouseY = -1;
          this.isMouseDown = false; // Trạng thái giữ chuột
          this.lastShotTime = 0; // Thời gian bắn cuối cùng
          this.shootInterval = 150; // Khoảng cách giữa các lần bắn (ms) - tăng từ 100 lên 150
          this.score = 0; // Điểm số
          this.level = 1; // Cấp độ
          this.meteorsDestroyed = 0; // Số thiên thạch đã phá hủy
          this.spaceshipHealth = 5; // Máu phi thuyền
          this.maxSpaceshipHealth = 5; // Máu tối đa
          this.gameOver = false; // Trạng thái game over
          this.shakeIntensity = 0; // Cường độ rung lắc
          this.shakeTime = 0; // Thời gian rung lắc
          this.spaceshipImage = null; // Ảnh phi thuyền
          this.animationTime = 0; // Thời gian animation
          this.blackHole = null; // Hố đen
          this.blackHoleParticles = []; // Particle của hố đen
          this.paused = false; // Trạng thái tạm dừng
          this.meteorNames = [ // Danh sách tên thiên thạch
            'Apophis', 'Bennu', 'Ceres', 'Eros', 'Gaspra', 'Ida', 'Mathilde', 'Vesta',
            'Pallas', 'Juno', 'Hygiea', 'Interamnia', 'Europa', 'Davida', 'Sylvia',
            'Hektor', 'Euphrosyne', 'Psyche', 'Cybele', 'Thisbe', 'Melpomene',
            'Fortuna', 'Massalia', 'Lutetia', 'Kalliope', 'Thalia', 'Themis',
            'Phocaea', 'Proserpina', 'Euterpe', 'Bellona', 'Amphitrite', 'Urania',
            'Parthenope', 'Victoria', 'Egeria', 'Irene', 'Meliboea', 'Thetis'
          ];
          this.meteorImageUrls = [ // All image URLs
            'https://static.vecteezy.com/system/resources/thumbnails/028/086/336/small_2x/fire-asteroid-isolated-on-transparent-background-file-cut-out-ai-generated-png.png',
            'https://static.vecteezy.com/system/resources/previews/028/086/324/non_2x/fire-asteroid-isolated-on-transparent-background-file-cut-out-ai-generated-png.png',
            'https://www.pngarts.com/files/12/Meteor-Asteroid-PNG-Image.png',
            'https://wallpapers.com/images/thumbnail/fiery-asteroid-png-lay88-c36whi38klprkcgz.webp',
            'https://png.pngtree.com/png-vector/20240430/ourmid/pngtree-giant-asteroid-3d-rendering-in-space-png-image_12347504.png',
            'https://png.pngtree.com/png-clipart/20240612/original/pngtree-giant-asteroid-rendering-in-space-png-image_15307539.png',
            'https://png.pngtree.com/png-vector/20231001/ourmid/pngtree-three-dimensional-3d-model-outer-space-universe-stars-moon-decorative-pattern-png-image_10133637.png'
          ];
          this.imagesLoadedCount = 0;
          this.allImagesPreloaded = false;

          this.resize();

          // Thêm event listener cho resize
          window.addEventListener('resize', () => this.handleResize());

          this.preloadImages().then(() => {
            this.allImagesPreloaded = true;
            this.preloadSpaceshipImage().then(() => {
              this.init();
              this.animate();
            });
          });

          window.addEventListener('resize', () => this.resize());

          // Thêm event listener cho mousedown và mouseup
          this.canvas.addEventListener('mousedown', (event) => this.handleMouseDown(event));
          this.canvas.addEventListener('mouseup', (event) => this.handleMouseUp(event));
          this.canvas.addEventListener('click', (event) => this.handleClick(event));

          // Thêm event listener cho mousemove để thay đổi cursor
          this.canvas.addEventListener('mousemove', (event) => this.handleMouseMove(event));
        }

        resize() {
          const rect = this.canvas.getBoundingClientRect();
          this.canvas.width = Math.max(360, Math.floor(rect.width || window.innerWidth));
          this.canvas.height = Math.max(300, Math.floor(rect.height || window.innerHeight));
        }

        handleResize() {
          this.resize();
          // UI sẽ tự động ẩn/hiện dựa trên kích thước màn hình trong drawUI()
        }

        preloadImages() {
          return new Promise(resolve => {
            if (this.meteorImageUrls.length === 0) {
              resolve();
              return;
            }

            this.meteorImageUrls.forEach(url => {
              const img = new Image();
              img.src = url;
              img.onload = () => {
                this.imagesLoadedCount++;
                if (this.imagesLoadedCount === this.meteorImageUrls.length) {
                  resolve();
                }
              };
              img.onerror = () => {
                this.imagesLoadedCount++; // Still count as loaded to not block
                console.warn(`Failed to load meteor image: ${url}`);
                if (this.imagesLoadedCount === this.meteorImageUrls.length) {
                  resolve();
                }
              };
              this.meteorImages.push(img);
            });
          });
        }

        preloadSpaceshipImage() {
          return new Promise(resolve => {
            const img = new Image();
            img.src = 'assets/images/starship.gif';
            img.alt = 'Spaceship';
            img.title = 'Spaceship';
            img.style.width = 200;
            img.style.height = 200;
            img.onload = () => {
              this.spaceshipImage = img;
              // Lưu ý: Canvas không hỗ trợ animation GIF, chỉ hiển thị frame đầu tiên
              console.log('Spaceship image loaded (GIF animation will not work in Canvas)');
              resolve();
            };
            img.onerror = () => {
              console.warn('Failed to load spaceship image, using fallback');
              resolve();
            };
          });
        }

        init() {
          // Tạo thiên thạch ban đầu
          this.createMeteor();

          // Tạo hố đen
          // this.createBlackHole(); // Tạm thời tắt hiệu ứng hố đen
        }

        createBlackHole() {
          this.blackHole = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            radius: 20, // Tâm hố đen nhỏ hơn
            rotation: 0,
            rotationSpeed: 0.01, // Chậm hơn
            eventHorizon: 30, // Chân trời sự kiện nhỏ
            accretionDisk: 250, // Đĩa bồi tụ rộng hơn nhiều
            spiralArms: 2, // Số cánh xoắn ốc
            tilt: Math.PI / 6 // Góc nghiêng 30 độ
          };

          // Tạo particle cho hố đen
          this.createBlackHoleParticles();
        }

        createBlackHoleParticles() {
          this.blackHoleParticles = [];

          // Tạo particle với hình xoắn ốc và nhiều hơn
          for (let i = 0; i < 3000; i++) { // Tăng từ 1500 lên 3000
            const baseAngle = Math.random() * Math.PI * 2;
            const randomFactor = Math.random();
            const distance = this.blackHole.eventHorizon + Math.pow(randomFactor, 2) * (this.blackHole.accretionDisk - this.blackHole.eventHorizon);

            // Tạo hình xoắn ốc
            const spiralAngle = baseAngle + (distance / this.blackHole.accretionDisk) * Math.PI * 4; // 2 vòng xoắn
            const speed = Math.sqrt(this.blackHole.radius / distance) * 0.15;

            // Áp dụng góc nghiêng
            const tiltedX = Math.cos(spiralAngle) * distance;
            const tiltedY = Math.sin(spiralAngle) * distance * Math.cos(this.blackHole.tilt);
            const tiltedZ = Math.sin(spiralAngle) * distance * Math.sin(this.blackHole.tilt);

            this.blackHoleParticles.push({
              x: this.blackHole.x + tiltedX,
              y: this.blackHole.y + tiltedY,
              z: tiltedZ, // Thêm trục Z cho hiệu ứng 3D
              vx: -Math.sin(spiralAngle) * speed,
              vy: Math.cos(spiralAngle) * speed * Math.cos(this.blackHole.tilt),
              vz: Math.cos(spiralAngle) * speed * Math.sin(this.blackHole.tilt),
              size: Math.random() * 1.2 + 0.2,
              life: 1.0,
              decay: 0.0002,
              color: this.getBlackHoleParticleColor(distance),
              angle: spiralAngle,
              distance: distance,
              originalDistance: distance,
              isAccretion: true,
              spiralArm: Math.floor(baseAngle / (Math.PI * 2 / this.blackHole.spiralArms)) // Thuộc cánh xoắn ốc nào
            });
          }

          // Tạo particle bị cuốn vào với hình xoắn ốc
          for (let i = 0; i < 800; i++) { // Tăng từ 300 lên 800
            const baseAngle = Math.random() * Math.PI * 2;
            const distance = this.blackHole.eventHorizon + Math.random() * (this.blackHole.accretionDisk - this.blackHole.eventHorizon);

            // Tạo hình xoắn ốc bị cuốn vào
            const spiralAngle = baseAngle + (distance / this.blackHole.accretionDisk) * Math.PI * 6; // 3 vòng xoắn
            const inwardSpeed = 0.05;
            const orbitalSpeed = 0.1;

            // Áp dụng góc nghiêng
            const tiltedX = Math.cos(spiralAngle) * distance;
            const tiltedY = Math.sin(spiralAngle) * distance * Math.cos(this.blackHole.tilt);
            const tiltedZ = Math.sin(spiralAngle) * distance * Math.sin(this.blackHole.tilt);

            this.blackHoleParticles.push({
              x: this.blackHole.x + tiltedX,
              y: this.blackHole.y + tiltedY,
              z: tiltedZ,
              vx: -Math.sin(spiralAngle) * orbitalSpeed - tiltedX * inwardSpeed * 0.001,
              vy: Math.cos(spiralAngle) * orbitalSpeed * Math.cos(this.blackHole.tilt) - tiltedY * inwardSpeed * 0.001,
              vz: Math.cos(spiralAngle) * orbitalSpeed * Math.sin(this.blackHole.tilt) - tiltedZ * inwardSpeed * 0.001,
              size: Math.random() * 0.8 + 0.1,
              life: 1.0,
              decay: 0.0003,
              color: this.getBlackHoleParticleColor(distance),
              angle: spiralAngle,
              distance: distance,
              originalDistance: distance,
              isSpiraling: true,
              spiralArm: Math.floor(baseAngle / (Math.PI * 2 / this.blackHole.spiralArms))
            });
          }
        }

        getParticleColor(distance) {
          const normalizedDistance = (distance - this.blackHole.eventHorizon) / (this.blackHole.accretionDisk - this.blackHole.eventHorizon);

          if (normalizedDistance < 0.2) {
            return '#FF0000'; // Đỏ sáng gần hố đen
          } else if (normalizedDistance < 0.4) {
            return '#FF3300'; // Đỏ cam
          } else if (normalizedDistance < 0.6) {
            return '#FF6600'; // Cam
          } else if (normalizedDistance < 0.8) {
            return '#FF9900'; // Cam vàng
          } else {
            return '#FFCC00'; // Vàng
          }
        }

        getParticleTemperature(distance) {
          const normalizedDistance = (distance - this.blackHole.eventHorizon) / (this.blackHole.accretionDisk - this.blackHole.eventHorizon);
          return 1 - normalizedDistance; // Nhiệt độ cao hơn gần hố đen
        }

        getJetColor() {
          const colors = ['#FFFFFF', '#00FFFF', '#0080FF', '#80FFFF'];
          return colors[Math.floor(Math.random() * colors.length)];
        }

        getDustColor() {
          const colors = ['#666666', '#888888', '#AAAAAA', '#CCCCCC'];
          return colors[Math.floor(Math.random() * colors.length)];
        }

        getBlackHoleParticleColor(distance) {
          const normalizedDistance = (distance - this.blackHole.eventHorizon) / (this.blackHole.accretionDisk - this.blackHole.eventHorizon);

          // Màu trắng và xanh dương cho hố đen
          if (normalizedDistance < 0.3) {
            return '#FFFFFF'; // Trắng sáng gần tâm
          } else if (normalizedDistance < 0.6) {
            return '#CCFFFF'; // Trắng xanh nhạt
          } else if (normalizedDistance < 0.8) {
            return '#99CCFF'; // Xanh dương nhạt
          } else {
            return '#6699FF'; // Xanh dương
          }
        }

        updateBlackHole() {
          if (!this.blackHole) return;

          // Cập nhật rotation của hố đen
          this.blackHole.rotation += this.blackHole.rotationSpeed;

          // Cập nhật particle với hiệu ứng xoắn ốc và 3D
          for (let i = this.blackHoleParticles.length - 1; i >= 0; i--) {
            const particle = this.blackHoleParticles[i];

            // Cập nhật vị trí 3D
            particle.x += particle.vx;
            particle.y += particle.vy;
            if (particle.z !== undefined) {
              particle.z += particle.vz;
            }
            particle.life -= particle.decay;

            // Tính khoảng cách từ hố đen (3D)
            const dx = particle.x - this.blackHole.x;
            const dy = particle.y - this.blackHole.y;
            const dz = particle.z || 0;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (particle.isSpiraling) {
              // Particle bị cuốn vào với hình xoắn ốc
              const inwardForce = 0.0008;
              const forceX = -dx / distance * inwardForce;
              const forceY = -dy / distance * inwardForce;
              const forceZ = -dz / distance * inwardForce;

              particle.vx += forceX;
              particle.vy += forceY;
              if (particle.vz !== undefined) {
                particle.vz += forceZ;
              }

              // Chuyển động xoắn ốc mạnh hơn
              const spiralForce = 0.001;
              const perpX = -dy / distance;
              const perpY = dx / distance;
              particle.vx += perpX * spiralForce;
              particle.vy += perpY * spiralForce;

            } else if (particle.isAccretion) {
              // Particle đĩa bồi tụ với xoắn ốc
              const gravity = (this.blackHole.radius * this.blackHole.radius) / (distance * distance) * 0.008;
              const forceX = -dx / distance * gravity;
              const forceY = -dy / distance * gravity;
              const forceZ = -dz / distance * gravity;

              particle.vx += forceX;
              particle.vy += forceY;
              if (particle.vz !== undefined) {
                particle.vz += forceZ;
              }

              // Lực ly tâm cho quỹ đạo xoắn ốc
              const centrifugalForce = 0.003;
              const perpX = -dy / distance;
              const perpY = dx / distance;
              particle.vx += perpX * centrifugalForce;
              particle.vy += perpY * centrifugalForce;

              // Cập nhật góc xoắn ốc
              particle.angle += 0.01;
            }

            // Ma sát nhẹ
            particle.vx *= 0.9998;
            particle.vy *= 0.9998;
            if (particle.vz !== undefined) {
              particle.vz *= 0.9998;
            }

            // Giới hạn tốc độ
            const maxSpeed = 0.25;
            const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy + (particle.vz || 0) * (particle.vz || 0));
            if (speed > maxSpeed) {
              particle.vx = (particle.vx / speed) * maxSpeed;
              particle.vy = (particle.vy / speed) * maxSpeed;
              if (particle.vz !== undefined) {
                particle.vz = (particle.vz / speed) * maxSpeed;
              }
            }

            // Xóa particle nếu quá gần hố đen hoặc hết life
            if (distance < this.blackHole.eventHorizon * 0.4 || particle.life <= 0) {
              this.blackHoleParticles.splice(i, 1);

              // Tạo particle mới để thay thế
              if (Math.random() < 0.4) {
                this.createNewBlackHoleParticle();
              }
            }
          }
        }

        createNewBlackHoleParticle() {
          const angle = Math.random() * Math.PI * 2;
          const distance = this.blackHole.accretionDisk + Math.random() * 50;
          const speed = Math.sqrt(this.blackHole.radius / distance) * 0.3;

          this.blackHoleParticles.push({
            x: this.blackHole.x + Math.cos(angle) * distance,
            y: this.blackHole.y + Math.sin(angle) * distance,
            vx: -Math.sin(angle) * speed,
            vy: Math.cos(angle) * speed,
            size: Math.random() * 3 + 1,
            life: 1.0,
            decay: 0.001,
            color: this.getParticleColor(distance),
            angle: angle,
            distance: distance,
            originalDistance: distance
          });
        }

        handleMouseDown(event) {
          this.isMouseDown = true;
        }

        handleMouseUp(event) {
          this.isMouseDown = false;
        }

        handleClick(event) {
          const rect = this.canvas.getBoundingClientRect();
          const scaleX = this.canvas.width / rect.width;
          const scaleY = this.canvas.height / rect.height;
          const clickX = (event.clientX - rect.left) * scaleX;
          const clickY = (event.clientY - rect.top) * scaleY;

          // Kiểm tra click vào nút X khi game over
          if (this.gameOver) {
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            const boxWidth = 400;
            const closeButtonSize = 30;
            const closeButtonX = centerX + boxWidth / 2 - closeButtonSize - 10;
            const closeButtonY = centerY - 150 + 10;

            if (clickX >= closeButtonX && clickX <= closeButtonX + closeButtonSize &&
              clickY >= closeButtonY && clickY <= closeButtonY + closeButtonSize) {
              // Reset game
              this.gameOver = false;
              this.spaceshipHealth = this.maxSpaceshipHealth;
              this.score = 0;
              this.level = 1;
              this.meteorsDestroyed = 0;
              this.meteors = [];
              this.bullets = [];
              this.explosions = [];
              this.shakeTime = 0;
              this.shakeIntensity = 0;
            }
            return;
          }
        }

        createBullet() {
          const speed = 8;

          const bullet = {
            x: this.mouseX,
            y: this.mouseY,
            vx: 0,
            vy: -speed,
            size: this.getBulletSize(),
            life: 1.0,
            decay: 0.01,
            level: this.level,
            color: this.getBulletColor(),
            trail: [], // Trail cho hiệu ứng sao băng
            angle: -Math.PI / 2,
            rotationSpeed: 0.1 // Tốc độ xoay
          };
          this.bullets.push(bullet);
        }

        getBulletSize() {
          return 3 + (this.level - 1) * 2; // Tăng kích thước theo cấp độ
        }

        getBulletColor() {
          if (this.level === 1) return '#ff0097'; // Cam
          if (this.level === 2) return '#00FF00'; // Xanh lục sáng
          if (this.level === 3) return '#00BFFF'; // Xanh dương sáng
          if (this.level === 4) return '#FF00FF'; // Tím
          return '#FFFF00'; // Vàng cho cấp độ cao
        }

        getMeteorHealth() {
          // Thiên thạch cần ít đạn hơn khi lên cấp
          const baseHealth = Math.floor(Math.random() * 5) + 3; // 3-7 đạn
          const levelReduction = Math.floor(this.level / 2); // Giảm 1 đạn mỗi 2 cấp
          return Math.max(1, baseHealth - levelReduction);
        }

        getLevelRequirement() {
          // Yêu cầu lên cấp: 6, 12, 18, 26, 36, 48, 62, 78, 96, 116...
          if (this.level === 1) return 6;
          if (this.level === 2) return 12;
          if (this.level === 3) return 18;
          if (this.level === 4) return 26;
          if (this.level === 5) return 36;
          if (this.level === 6) return 48;
          if (this.level === 7) return 62;
          if (this.level === 8) return 78;
          if (this.level === 9) return 96;
          if (this.level === 10) return 116;
          // Công thức cho cấp độ cao hơn
          return this.level * (this.level + 1) + 4;
        }

        getRandomMeteorName() {
          return this.meteorNames[Math.floor(Math.random() * this.meteorNames.length)];
        }

        levelUp() {
          this.level++;
          this.meteorsDestroyed = 0;
          this.shootInterval = Math.max(50, this.shootInterval - 10); // Tăng tốc độ bắn
        }

        startShake(intensity = 10) {
          this.shakeIntensity = intensity;
          this.shakeTime = 20; // 20 frames shake

          // Trigger screen shake effect for entire layout
          this.triggerScreenShake(intensity);
        }

        triggerScreenShake(intensity) {
          const container = document.getElementById('container');

          if (!container) return; // Safety check

          // Remove any existing shake classes
          container.classList.remove('screen-shake', 'screen-shake-intense');

          // Add appropriate shake class based on intensity
          if (intensity >= 15) {
            container.classList.add('screen-shake-intense');
          } else {
            container.classList.add('screen-shake');
          }

          // Remove the class after animation completes
          setTimeout(() => {
            container.classList.remove('screen-shake', 'screen-shake-intense');
          }, intensity >= 15 ? 600 : 500);
        }

        isPointInMeteor(x, y, meteor) {
          // Kiểm tra xem điểm click có nằm trong thiên thạch không
          const distance = Math.sqrt((x - meteor.x) ** 2 + (y - meteor.y) ** 2);
          return distance <= meteor.size;
        }

        handleMouseMove(event) {
          const rect = this.canvas.getBoundingClientRect();
          const scaleX = this.canvas.width / rect.width;
          const scaleY = this.canvas.height / rect.height;
          this.mouseX = (event.clientX - rect.left) * scaleX;
          this.mouseY = (event.clientY - rect.top) * scaleY;
        }

        createMeteor() {
          if (!this.allImagesPreloaded || this.meteorImages.length === 0) {
            // Fallback: draw a simple shape if no image is assigned (e.g., if preloading failed or fallback was used)
            const meteor = {
              x: Math.random() * this.canvas.width,
              y: -100, // Bắt đầu từ trên màn hình
              vx: 0,
              vy: Math.random() * 4 + 3, // Tốc độ rơi xuống
              size: Math.random() * 30 + 25,
              angle: 0,
              rotationSpeed: (Math.random() - 0.5) * 0.1,
              trail: [],
              life: 1.0,
              explosionTimer: -1, // Không sử dụng timer nữa
              isExploding: false,
              image: null, // No image
              color: `hsl(${Math.random() * 30 + 20}, 80%, 50%)`, // Add color for fallback
              health: this.getMeteorHealth(), // Số đạn cần để phá hủy
              maxHealth: 0, // Sẽ được set trong getMeteorHealth
              damage: 0, // Số đạn đã bắn trúng
              name: this.getRandomMeteorName() // Tên thiên thạch
            };
            this.meteors.push(meteor);
            return;
          }

          const randomImage = this.meteorImages[Math.floor(Math.random() * this.meteorImages.length)];

          const meteor = {
            x: Math.random() * this.canvas.width,
            y: -100, // Bắt đầu từ trên màn hình
            vx: 0,
            vy: Math.random() * 4 + 3, // Tốc độ rơi xuống
            size: Math.random() * 30 + 25, // Kích thước thiên thạch
            angle: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.1, // Xoay ngẫu nhiên
            trail: [],
            life: 1.0,
            explosionTimer: -1, // Không sử dụng timer nữa
            isExploding: false,
            image: randomImage, // Assign preloaded image
            color: `hsl(${Math.random() * 30 + 20}, 80%, 50%)`, // Add color for fallback
            health: this.getMeteorHealth(), // Số đạn cần để phá hủy
            maxHealth: 0, // Sẽ được set trong getMeteorHealth
            damage: 0, // Số đạn đã bắn trúng
            name: this.getRandomMeteorName() // Tên thiên thạch
          };
          this.meteors.push(meteor);
        }

        createExplosion(x, y, size, meteorImage) {
          const explosion = {
            x: x,
            y: y,
            particles: [],
            life: 1.0,
            decay: 0.02
          };

          // Tạo các mảnh vỡ từ ảnh thiên thạch
          const fragmentCount = 15; // Số mảnh vỡ
          for (let i = 0; i < fragmentCount; i++) {
            explosion.particles.push({
              x: x,
              y: y,
              vx: (Math.random() - 0.5) * 15,
              vy: (Math.random() - 0.5) * 15,
              size: Math.random() * size * 0.3 + size * 0.1, // Kích thước mảnh vỡ
              life: 1.0,
              decay: Math.random() * 0.03 + 0.01,
              rotation: Math.random() * Math.PI * 2,
              rotationSpeed: (Math.random() - 0.5) * 0.2,
              image: meteorImage, // Sử dụng ảnh thiên thạch gốc
              imageLoaded: meteorImage ? true : false,
              fragmentScale: Math.random() * 0.5 + 0.3, // Tỷ lệ thu nhỏ mảnh vỡ
              color: `hsl(${Math.random() * 40 + 10}, 95%, 60%)` // Màu cam/đỏ sáng hơn
            });
          }

          // Thêm các hạt lửa nhỏ
          for (let i = 0; i < 20; i++) {
            explosion.particles.push({
              x: x,
              y: y,
              vx: (Math.random() - 0.5) * 10,
              vy: (Math.random() - 0.5) * 10,
              size: Math.random() * 4 + 2,
              life: 1.0,
              decay: Math.random() * 0.05 + 0.02,
              rotation: 0,
              rotationSpeed: 0,
              image: null,
              imageLoaded: false,
              fragmentScale: 1,
              color: `hsl(${Math.random() * 30 + 10}, 100%, 70%)` // Màu lửa sáng
            });
          }

          this.explosions.push(explosion);
        }

        update() {
          // Cập nhật thời gian animation
          this.animationTime += 0.1;

          // Cập nhật hố đen
          // this.updateBlackHole(); // Tạm thời tắt hiệu ứng hố đen

          // Cập nhật rung lắc
          if (this.shakeTime > 0) {
            this.shakeTime--;
            this.shakeIntensity *= 0.9; // Giảm dần cường độ
          }

          // Tạo đạn khi giữ chuột (chỉ khi chưa game over)
          if (this.isMouseDown && this.mouseX >= 0 && this.mouseY >= 0 && !this.gameOver) {
            const currentTime = Date.now();
            if (currentTime - this.lastShotTime > this.shootInterval) {
              this.createBullet();
              this.lastShotTime = currentTime;
            }
          }

          // Cập nhật đạn
          for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];

            // Lưu vị trí cũ cho trail
            bullet.trail.push({ x: bullet.x, y: bullet.y });
            if (bullet.trail.length > 15) {
              bullet.trail.shift();
            }

            bullet.x += bullet.vx;
            bullet.y += bullet.vy;
            bullet.life -= bullet.decay;
            bullet.angle += bullet.rotationSpeed;

            // Xóa đạn khi ra khỏi màn hình hoặc hết life
            if (bullet.y < -10 || bullet.life <= 0) {
              this.bullets.splice(i, 1);
              continue;
            }

            // Kiểm tra va chạm với thiên thạch
            for (let j = this.meteors.length - 1; j >= 0; j--) {
              const meteor = this.meteors[j];
              if (!meteor.isExploding) {
                const distance = Math.sqrt((bullet.x - meteor.x) ** 2 + (bullet.y - meteor.y) ** 2);
                if (distance <= meteor.size + bullet.size) {
                  // Va chạm! Giảm health của thiên thạch
                  meteor.damage++;
                  this.bullets.splice(i, 1);

                  // Kiểm tra xem thiên thạch có bị phá hủy không
                  if (meteor.damage >= meteor.health) {
                    meteor.isExploding = true;
                    this.createExplosion(meteor.x, meteor.y, meteor.size, meteor.image);

                    // Tăng điểm và số thiên thạch đã phá hủy
                    this.score += 10 * this.level;
                    this.meteorsDestroyed++;

                    // Kiểm tra lên cấp theo yêu cầu mới
                    const required = this.getLevelRequirement();
                    if (this.meteorsDestroyed >= required) {
                      this.levelUp();
                    }
                  }

                  break;
                }
              }
            }
          }

          // Cập nhật thiên thạch
          for (let i = this.meteors.length - 1; i >= 0; i--) {
            const meteor = this.meteors[i];

            if (!meteor.isExploding) {
              // Lưu vị trí cũ cho trail
              meteor.trail.push({ x: meteor.x, y: meteor.y });
              if (meteor.trail.length > 20) {
                meteor.trail.shift();
              }

              // Cập nhật vị trí
              meteor.x += meteor.vx;
              meteor.y += meteor.vy;
              meteor.angle += meteor.rotationSpeed;

              // Kiểm tra va chạm với phi thuyền
              if (this.mouseX >= 0 && this.mouseY >= 0 && !this.gameOver) {
                const distance = Math.sqrt((meteor.x - this.mouseX) ** 2 + (meteor.y - this.mouseY) ** 2);
                if (distance <= meteor.size + 40) { // 40px là kích thước phi thuyền (tăng từ 20)
                  // Va chạm với phi thuyền
                  meteor.isExploding = true;
                  this.createExplosion(meteor.x, meteor.y, meteor.size, meteor.image);

                  // Giảm máu phi thuyền
                  this.spaceshipHealth--;
                  this.startShake(15);

                  // Kiểm tra game over
                  if (this.spaceshipHealth <= 0) {
                    this.gameOver = true;
                  }
                }
              }

              // Nổ khi chạm chân màn hình
              if (meteor.y > this.canvas.height - meteor.size) {
                meteor.isExploding = true;
                this.createExplosion(meteor.x, meteor.y, meteor.size, meteor.image);
              }
            } else {
              // Thiên thạch đang nổ
              meteor.life -= 0.03;
              if (meteor.life <= 0) {
                this.meteors.splice(i, 1);
              }
            }

            // Xóa thiên thạch khi ra khỏi màn hình (rơi quá xa dưới hoặc ra ngoài biên)
            if (meteor.y > this.canvas.height + 100 || meteor.x < -100 || meteor.x > this.canvas.width + 100) {
              this.meteors.splice(i, 1);
            }
          }

          // Cập nhật vụ nổ
          for (let i = this.explosions.length - 1; i >= 0; i--) {
            const explosion = this.explosions[i];

            for (let j = explosion.particles.length - 1; j >= 0; j--) {
              const particle = explosion.particles[j];
              particle.x += particle.vx;
              particle.y += particle.vy;
              particle.vx *= 0.98; // Ma sát
              particle.vy *= 0.98;
              particle.rotation += particle.rotationSpeed; // Xoay mảnh vỡ
              particle.life -= particle.decay;

              if (particle.life <= 0) {
                explosion.particles.splice(j, 1);
              }
            }

            explosion.life -= explosion.decay;
            if (explosion.life <= 0 || explosion.particles.length === 0) {
              this.explosions.splice(i, 1);
            }
          }

          // Tạo thiên thạch mới ngẫu nhiên (tăng gấp đôi tần suất)
          if (Math.random() < 0.004) {
            this.createMeteor();
          }
        }

        drawMeteor(meteor) {
          if (meteor.isExploding) {
            // Vẽ thiên thạch đang nổ
            this.ctx.save();
            this.ctx.globalAlpha = meteor.life;
            if (meteor.imageLoaded && meteor.image) {
              // Vẽ ảnh thiên thạch đang nổ
              this.ctx.translate(meteor.x, meteor.y);
              this.ctx.rotate(meteor.angle);
              this.ctx.drawImage(meteor.image, -meteor.size * meteor.life, -meteor.size * meteor.life,
                meteor.size * 2 * meteor.life, meteor.size * 2 * meteor.life);
            } else {
              // Fallback: vẽ hình tròn nếu không có ảnh
              this.ctx.fillStyle = meteor.color || '#ff6b35';
              this.ctx.beginPath();
              this.ctx.arc(meteor.x, meteor.y, meteor.size * meteor.life, 0, Math.PI * 2);
              this.ctx.fill();
            }
            this.ctx.restore();
          } else {
            // Vẽ trail lửa trông thật hơn
            for (let i = 0; i < meteor.trail.length; i++) {
              const trailPoint = meteor.trail[i];
              const alpha = (i / meteor.trail.length) * 0.8; // Alpha fades out
              const trailSize = (i / meteor.trail.length) * meteor.size * 0.3 + 5; // Size grows towards the back

              // Main fiery core
              this.ctx.fillStyle = `rgba(255, ${150 + i * 2}, ${50 + i * 2}, ${alpha})`;
              this.ctx.beginPath();
              this.ctx.arc(trailPoint.x, trailPoint.y, trailSize * 0.8, 0, Math.PI * 2);
              this.ctx.fill();

              // Outer glow/flicker
              this.ctx.fillStyle = `rgba(255, ${200 + i * 1}, ${100 + i * 1}, ${alpha * 0.5})`;
              this.ctx.beginPath();
              this.ctx.arc(trailPoint.x, trailPoint.y, trailSize * 1.2, 0, Math.PI * 2);
              this.ctx.fill();
            }

            // Vẽ thiên thạch
            this.ctx.save();
            this.ctx.translate(meteor.x, meteor.y);
            this.ctx.rotate(meteor.angle);

            if (meteor.image) { // Check if an image object is assigned
              const img = meteor.image;
              const imgWidth = meteor.size * 2; // Scale image to meteor size
              const imgHeight = (img.height / img.width) * imgWidth;
              this.ctx.drawImage(img, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
            } else {
              // Fallback: draw a simple shape if no image is assigned (e.g., if preloading failed or fallback was used)
              this.ctx.fillStyle = meteor.color;
              this.ctx.beginPath();
              this.ctx.ellipse(0, 0, meteor.size, meteor.size * 0.7, 0, 0, Math.PI * 2);
              this.ctx.fill();
            }

            this.ctx.restore();

            // Hiệu ứng sáng cam/đỏ xung quanh
            const gradient = this.ctx.createRadialGradient(meteor.x, meteor.y, 0, meteor.x, meteor.y, meteor.size * 2.5);
            gradient.addColorStop(0, `rgba(255, 150, 50, 0.4)`);
            gradient.addColorStop(0.5, `rgba(255, 100, 30, 0.2)`);
            gradient.addColorStop(1, 'rgba(255, 50, 10, 0)');

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(meteor.x, meteor.y, meteor.size * 2.5, 0, Math.PI * 2);
            this.ctx.fill();

            // Vẽ tên thiên thạch
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(meteor.name, meteor.x, meteor.y - meteor.size - 25);

            // Vẽ health bar cho thiên thạch
            if (meteor.health > 1) {
              const barWidth = meteor.size * 2;
              const barHeight = 4;
              const barX = meteor.x - barWidth / 2;
              const barY = meteor.y - meteor.size - 10;

              // Background bar
              this.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
              this.ctx.fillRect(barX, barY, barWidth, barHeight);

              // Health bar
              const healthPercent = (meteor.health - meteor.damage) / meteor.health;
              this.ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
              this.ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

              // Border
              this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
              this.ctx.lineWidth = 1;
              this.ctx.strokeRect(barX, barY, barWidth, barHeight);
            }
          }
        }

        drawExplosion(explosion) {
          for (const particle of explosion.particles) {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;

            if (particle.imageLoaded && particle.image) {
              // Vẽ mảnh vỡ từ ảnh thiên thạch
              this.ctx.translate(particle.x, particle.y);
              this.ctx.rotate(particle.rotation);
              const fragmentSize = particle.size * particle.fragmentScale;
              this.ctx.drawImage(particle.image, -fragmentSize, -fragmentSize,
                fragmentSize * 2, fragmentSize * 2);
            } else {
              // Vẽ hạt lửa thông thường
              this.ctx.fillStyle = particle.color;
              this.ctx.beginPath();
              this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
              this.ctx.fill();
            }

            this.ctx.restore();
          }
        }

        drawSpaceship() {
          if (this.mouseX >= 0 && this.mouseY >= 0) {
            this.ctx.save();
            this.ctx.translate(this.mouseX, this.mouseY);
            this.ctx.rotate(0);

            // Hiệu ứng nhấp nháy và scale
            const pulse = 1 + Math.sin(this.animationTime * 2) * 0.05; // Nhấp nháy nhẹ
            const scale = 1 + Math.sin(this.animationTime * 0.5) * 0.02; // Scale nhẹ
            this.ctx.scale(pulse * scale, pulse * scale);

            if (this.spaceshipImage) {
              // Vẽ ảnh phi thuyền với kích thước lớn hơn
              const size = 80;
              this.ctx.drawImage(this.spaceshipImage, -size / 2, -size / 2, size, size);
            } else {
              // Fallback: vẽ phi thuyền đơn giản với hiệu ứng
              this.ctx.fillStyle = '#4A90E2';
              this.ctx.beginPath();
              this.ctx.moveTo(0, -15);
              this.ctx.lineTo(-10, 10);
              this.ctx.lineTo(0, 5);
              this.ctx.lineTo(10, 10);
              this.ctx.closePath();
              this.ctx.fill();

              // Vẽ động cơ phản lực với hiệu ứng
              this.ctx.fillStyle = '#FF6B35';
              this.ctx.beginPath();
              this.ctx.ellipse(-5, 8, 3, 2, 0, 0, Math.PI * 2);
              this.ctx.fill();
              this.ctx.beginPath();
              this.ctx.ellipse(5, 8, 3, 2, 0, 0, Math.PI * 2);
              this.ctx.fill();
            }

            // Vẽ hiệu ứng động cơ phản lực
            this.drawEngineEffects();

            // Vẽ hiệu ứng năng lượng xung quanh
            this.drawEnergyField();

            this.ctx.restore();
          }
        }

        drawEngineEffects() {
          // Hiệu ứng động cơ phản lực
          const engineIntensity = 0.5 + Math.sin(this.animationTime * 8) * 0.3;

          // Động cơ trái
          this.ctx.save();
          this.ctx.translate(-5, 8);
          this.ctx.rotate(-Math.PI / 4.5);

          // Lửa động cơ
          for (let i = 0; i < 3; i++) {
            const flameLength = 8 + Math.sin(this.animationTime * 10 + i) * 3;
            const flameWidth = 2 + Math.sin(this.animationTime * 12 + i) * 1;

            this.ctx.fillStyle = `rgba(255, ${100 + i * 20}, ${50 + i * 10}, ${engineIntensity})`;
            this.ctx.beginPath();
            this.ctx.ellipse(0, flameLength / 2, flameWidth, flameLength, 0, 0, Math.PI * 2);
            this.ctx.fill();
          }
          this.ctx.restore();

          // Động cơ phải
          this.ctx.save();
          this.ctx.translate(5, 8);
          this.ctx.rotate(-Math.PI / 4.5);

          for (let i = 0; i < 3; i++) {
            const flameLength = 8 + Math.sin(this.animationTime * 10 + i + 1) * 3;
            const flameWidth = 2 + Math.sin(this.animationTime * 12 + i + 1) * 1;

            this.ctx.fillStyle = `rgba(255, ${100 + i * 20}, ${50 + i * 10}, ${engineIntensity})`;
            this.ctx.beginPath();
            this.ctx.ellipse(0, flameLength / 2, flameWidth, flameLength, 0, 0, Math.PI * 2);
            this.ctx.fill();
          }
          this.ctx.restore();
        }

        drawEnergyField() {
          // Hiệu ứng năng lượng xung quanh phi thuyền
          const energyRadius = 50 + Math.sin(this.animationTime * 3) * 10;
          const energyAlpha = 0.1 + Math.sin(this.animationTime * 4) * 0.05;

          // Vòng năng lượng ngoài
          this.ctx.strokeStyle = `rgba(0, 255, 255, ${energyAlpha})`;
          this.ctx.lineWidth = 2;
          this.ctx.beginPath();
          this.ctx.arc(0, 0, energyRadius, 0, Math.PI * 2);
          this.ctx.stroke();

          // Vòng năng lượng trong
          this.ctx.strokeStyle = `rgba(255, 255, 0, ${energyAlpha * 0.7})`;
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.arc(0, 0, energyRadius * 0.7, 0, Math.PI * 2);
          this.ctx.stroke();

          // Các tia năng lượng
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + this.animationTime;
            const rayLength = 30 + Math.sin(this.animationTime * 5 + i) * 10;

            this.ctx.strokeStyle = `rgba(0, 255, 255, ${0.3 + Math.sin(this.animationTime * 6 + i) * 0.2})`;
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(Math.cos(angle) * rayLength, Math.sin(angle) * rayLength);
            this.ctx.stroke();
          }
        }

        drawBullets() {
          for (const bullet of this.bullets) {
            this.ctx.save();

            // Vẽ trail sao băng
            this.drawBulletTrail(bullet);

            // Vẽ đạn chính
            this.ctx.globalAlpha = bullet.life;
            this.ctx.translate(bullet.x, bullet.y);
            this.ctx.rotate(bullet.angle);

            // Vẽ đạn hình bầu dục nhọn với hiệu ứng glow
            this.drawBulletGlow(bullet);

            // Vẽ đạn tròn
            this.ctx.fillStyle = bullet.color;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, bullet.size, 0, Math.PI * 2);
            this.ctx.fill();

            // Hiệu ứng sáng lõi tròn
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.beginPath();
            this.ctx.arc(0, 0, bullet.size * 0.6, 0, Math.PI * 2);
            this.ctx.fill();

            // Điểm sáng trung tâm
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.beginPath();
            this.ctx.arc(0, 0, bullet.size * 0.3, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.restore();
          }
        }

        drawBulletTrail(bullet) {
          // Vẽ trail sao băng
          for (let i = 0; i < bullet.trail.length; i++) {
            const trailPoint = bullet.trail[i];
            const alpha = (i / bullet.trail.length) * bullet.life * 0.8;
            const trailSize = (i / bullet.trail.length) * bullet.size * 0.5 + 2;

            // Trail chính
            this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(trailPoint.x, trailPoint.y, trailSize, 0, Math.PI * 2);
            this.ctx.fill();

            // Trail phụ với màu đạn
            const color = this.hexToRgba(bullet.color, alpha * 0.6);
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(trailPoint.x, trailPoint.y, trailSize * 0.7, 0, Math.PI * 2);
            this.ctx.fill();
          }
        }

        drawBulletGlow(bullet) {
          // Hiệu ứng glow xung quanh đạn
          const glowSize = bullet.size * 3;
          const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);

          // Tạo gradient dựa trên màu đạn
          const color = this.hexToRgba(bullet.color, 0.3);
          gradient.addColorStop(0, color);
          gradient.addColorStop(0.5, this.hexToRgba(bullet.color, 0.1));
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

          this.ctx.fillStyle = gradient;
          this.ctx.beginPath();
          this.ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
          this.ctx.fill();
        }

        hexToRgba(hex, alpha) {
          // Chuyển đổi hex color sang rgba
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }

        drawBlackHole() {
          if (!this.blackHole) return;

          this.ctx.save();

          // Sắp xếp particle theo độ sâu Z để vẽ đúng thứ tự
          const sortedParticles = [...this.blackHoleParticles].sort((a, b) => (b.z || 0) - (a.z || 0));

          // Vẽ particle của hố đen với hiệu ứng 3D và xoắn ốc
          for (const particle of sortedParticles) {
            this.ctx.save();

            // Tính độ trong suốt dựa trên độ sâu Z
            const zDepth = particle.z || 0;
            const depthAlpha = Math.max(0.3, 1 - Math.abs(zDepth) / 100);
            this.ctx.globalAlpha = particle.life * depthAlpha;

            // Tính kích thước dựa trên độ sâu Z
            const depthSize = particle.size * (1 + zDepth / 200);

            if (particle.isSpiraling) {
              // Vẽ particle bị cuốn vào với hiệu ứng xoắn ốc
              this.ctx.fillStyle = particle.color;
              this.ctx.beginPath();
              this.ctx.arc(particle.x, particle.y, depthSize, 0, Math.PI * 2);
              this.ctx.fill();

              // Hiệu ứng glow dựa trên cánh xoắn ốc
              const glowAlpha = 0.4 * (particle.spiralArm % 2 === 0 ? 1 : 0.7);
              this.ctx.fillStyle = this.hexToRgba(particle.color, glowAlpha);
              this.ctx.beginPath();
              this.ctx.arc(particle.x, particle.y, depthSize * 2, 0, Math.PI * 2);
              this.ctx.fill();

            } else if (particle.isAccretion) {
              // Vẽ particle đĩa bồi tụ với hiệu ứng xoắn ốc
              this.ctx.fillStyle = particle.color;
              this.ctx.beginPath();
              this.ctx.arc(particle.x, particle.y, depthSize, 0, Math.PI * 2);
              this.ctx.fill();

              // Hiệu ứng glow theo cánh xoắn ốc
              const glowAlpha = 0.3 * (particle.spiralArm % 2 === 0 ? 1 : 0.8);
              this.ctx.fillStyle = this.hexToRgba(particle.color, glowAlpha);
              this.ctx.beginPath();
              this.ctx.arc(particle.x, particle.y, depthSize * 1.5, 0, Math.PI * 2);
              this.ctx.fill();

              // Vẽ trail cho hiệu ứng xoắn ốc
              if (particle.spiralArm !== undefined) {
                this.ctx.strokeStyle = this.hexToRgba(particle.color, 0.2);
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                const trailLength = 20;
                const trailX = particle.x - particle.vx * trailLength;
                const trailY = particle.y - particle.vy * trailLength;
                this.ctx.moveTo(trailX, trailY);
                this.ctx.lineTo(particle.x, particle.y);
                this.ctx.stroke();
              }
            }

            this.ctx.restore();
          }

          // Vẽ đĩa bồi tụ với hiệu ứng nghiêng
          this.drawAccretionDisk();

          // Vẽ chân trời sự kiện với hiệu ứng nghiêng
          this.drawEventHorizon();

          // Vẽ hố đen chính với hiệu ứng nghiêng
          this.drawBlackHoleCore();

          this.ctx.restore();
        }

        getTemperatureColor(temperature) {
          // Màu sắc dựa trên nhiệt độ
          if (temperature > 0.8) {
            return '#FFFFFF'; // Trắng - rất nóng
          } else if (temperature > 0.6) {
            return '#FFFF00'; // Vàng - nóng
          } else if (temperature > 0.4) {
            return '#FF6600'; // Cam - ấm
          } else if (temperature > 0.2) {
            return '#FF3300'; // Đỏ cam - ấm
          } else {
            return '#FF0000'; // Đỏ - nóng
          }
        }

        drawAccretionDisk() {
          // Vẽ đĩa bồi tụ với hiệu ứng nghiêng (ellipse thay vì circle)
          this.ctx.save();

          // Áp dụng transformation để tạo hiệu ứng nghiêng
          this.ctx.translate(this.blackHole.x, this.blackHole.y);
          this.ctx.rotate(this.blackHole.rotation);
          this.ctx.scale(1, Math.cos(this.blackHole.tilt));

          // Vẽ đĩa bồi tụ với gradient trắng-xanh dương
          const gradient = this.ctx.createRadialGradient(0, 0, this.blackHole.eventHorizon, 0, 0, this.blackHole.accretionDisk);

          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
          gradient.addColorStop(0.3, 'rgba(200, 255, 255, 0.06)');
          gradient.addColorStop(0.6, 'rgba(100, 200, 255, 0.04)');
          gradient.addColorStop(1, 'rgba(50, 100, 255, 0.02)');

          this.ctx.fillStyle = gradient;
          this.ctx.beginPath();
          this.ctx.arc(0, 0, this.blackHole.accretionDisk, 0, Math.PI * 2);
          this.ctx.fill();

          this.ctx.restore();
        }

        drawEventHorizon() {
          // Vẽ chân trời sự kiện với gradient đen
          const gradient = this.ctx.createRadialGradient(
            this.blackHole.x, this.blackHole.y, 0,
            this.blackHole.x, this.blackHole.y, this.blackHole.eventHorizon
          );

          gradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
          gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.7)');
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');

          this.ctx.fillStyle = gradient;
          this.ctx.beginPath();
          this.ctx.arc(this.blackHole.x, this.blackHole.y, this.blackHole.eventHorizon, 0, Math.PI * 2);
          this.ctx.fill();
        }

        drawBlackHoleCore() {
          // Vẽ hố đen chính - hoàn toàn đen
          this.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
          this.ctx.beginPath();
          this.ctx.arc(this.blackHole.x, this.blackHole.y, this.blackHole.radius, 0, Math.PI * 2);
          this.ctx.fill();

          // Viền hố đen mỏng
          this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.arc(this.blackHole.x, this.blackHole.y, this.blackHole.radius, 0, Math.PI * 2);
          this.ctx.stroke();
        }

        draw() {
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

          // Áp dụng hiệu ứng rung lắc
          if (this.shakeTime > 0) {
            this.ctx.save();
            const shakeX = (Math.random() - 0.5) * this.shakeIntensity;
            const shakeY = (Math.random() - 0.5) * this.shakeIntensity;
            this.ctx.translate(shakeX, shakeY);
          }

          // Vẽ hố đen
          // this.drawBlackHole(); // Tạm thời tắt hiệu ứng hố đen

          // Vẽ đạn trước
          this.drawBullets();

          // Vẽ thiên thạch
          for (const meteor of this.meteors) {
            this.drawMeteor(meteor);
          }

          // Vẽ vụ nổ
          for (const explosion of this.explosions) {
            this.drawExplosion(explosion);
          }

          // Vẽ phi thuyền cuối cùng (để nó luôn ở trên)
          if (!this.gameOver) {
            this.drawSpaceship();
          }

          // Vẽ UI (điểm số và cấp độ)
          this.drawUI();

          // Vẽ Game Over
          if (this.gameOver) {
            this.drawGameOver();
          }

          // Kết thúc hiệu ứng rung lắc
          if (this.shakeTime > 0) {
            this.ctx.restore();
          }
        }

        drawUI() {
          // Kiểm tra kích thước màn hình - ẩn UI trên thiết bị nhỏ
          const isSmallScreen = window.innerWidth <= 768; // Tablet và nhỏ hơn
          if (isSmallScreen) {
            return; // Không vẽ UI trên màn hình nhỏ
          }

          this.ctx.save();

          // Tạo background cho UI - di chuyển xuống dưới màn hình
          const uiY = this.canvas.height - 220; // 220 = chiều cao UI + margin
          this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          this.ctx.fillRect(10, uiY, 300, 200);

          this.ctx.fillStyle = '#FFFFFF';
          this.ctx.font = 'bold 20px Arial';
          this.ctx.textAlign = 'left';
          this.ctx.fillText(`Score: ${this.score}`, 20, uiY + 25);
          this.ctx.fillText(`Level: ${this.level}`, 20, uiY + 55);

          const required = this.getLevelRequirement();
          this.ctx.fillText(`Meteors: ${this.meteorsDestroyed}/${required}`, 20, uiY + 85);

          // Hiển thị màu đạn hiện tại
          this.ctx.fillStyle = this.getBulletColor();
          this.ctx.fillRect(20, uiY + 100, 20, 10);
          this.ctx.fillStyle = '#FFFFFF';
          this.ctx.font = '14px Arial';
          this.ctx.fillText('Bullet Color', 50, uiY + 110);

          // Hiển thị thanh máu phi thuyền
          this.ctx.fillStyle = '#FFFFFF';
          this.ctx.font = 'bold 16px Arial';
          this.ctx.fillText('Ship Health:', 20, uiY + 140);

          const healthBarWidth = 200;
          const healthBarHeight = 15;
          const healthBarX = 20;
          const healthBarY = uiY + 150;

          // Background bar
          this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
          this.ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

          // Health bar
          const healthPercent = this.spaceshipHealth / this.maxSpaceshipHealth;
          this.ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
          this.ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercent, healthBarHeight);

          // Border
          this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          this.ctx.lineWidth = 2;
          this.ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

          // Text
          this.ctx.fillStyle = '#FFFFFF';
          this.ctx.font = 'bold 12px Arial';
          this.ctx.fillText(`${this.spaceshipHealth}/${this.maxSpaceshipHealth}`, healthBarX + healthBarWidth + 10, healthBarY + 12);

          this.ctx.restore();
        }

        drawGameOver() {
          this.ctx.save();

          // Vẽ background đen mờ
          this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
          this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

          // Vẽ khung game over
          const centerX = this.canvas.width / 2;
          const centerY = this.canvas.height / 2;
          const boxWidth = 400;
          const boxHeight = 300;

          // Background box
          this.ctx.fillStyle = 'rgba(20, 20, 20, 0.9)';
          this.ctx.fillRect(centerX - boxWidth / 2, centerY - boxHeight / 2, boxWidth, boxHeight);

          // Border
          this.ctx.strokeStyle = '#FF0000';
          this.ctx.lineWidth = 3;
          this.ctx.strokeRect(centerX - boxWidth / 2, centerY - boxHeight / 2, boxWidth, boxHeight);

          // Vẽ chữ GAME OVER
          this.ctx.fillStyle = '#FF0000';
          this.ctx.font = 'bold 60px Arial';
          this.ctx.textAlign = 'center';
          this.ctx.fillText('GAME OVER', centerX, centerY - 80);

          // Vẽ điểm số cuối
          this.ctx.fillStyle = '#FFFFFF';
          this.ctx.font = 'bold 24px Arial';
          this.ctx.fillText(`Final Score: ${this.score}`, centerX, centerY - 20);
          this.ctx.fillText(`Level Reached: ${this.level}`, centerX, centerY + 20);

          // Vẽ nút X để đóng
          const closeButtonSize = 30;
          const closeButtonX = centerX + boxWidth / 2 - closeButtonSize - 10;
          const closeButtonY = centerY - boxHeight / 2 + 10;

          // Background nút X
          this.ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
          this.ctx.fillRect(closeButtonX, closeButtonY, closeButtonSize, closeButtonSize);

          // Vẽ chữ X
          this.ctx.fillStyle = '#FFFFFF';
          this.ctx.font = 'bold 20px Arial';
          this.ctx.textAlign = 'center';
          this.ctx.fillText('X', closeButtonX + closeButtonSize / 2, closeButtonY + closeButtonSize / 2 + 7);

          // Vẽ hướng dẫn
          this.ctx.fillStyle = '#FFFF00';
          this.ctx.font = 'bold 18px Arial';
          this.ctx.fillText('Click X to close or refresh page to restart', centerX, centerY + 80);

          this.ctx.restore();
        }

        animate() {
          if (!this.paused) {
            this.update();
            this.draw();
          }
          requestAnimationFrame(() => this.animate());
        }
      }

      window.addEventListener('load', () => {
        const meteorCanvas = document.getElementById('meteor-canvas');
        if (meteorCanvas) {
          new MeteorAnimation(meteorCanvas);
        }
      });

      // Shooting Stars Animation
      class ShootingStar {
        constructor(canvas) {
          this.canvas = canvas;
          this.ctx = canvas.getContext('2d');
          this.stars = [];
          this.resize();
          this.init();
          this.animate();

          window.addEventListener('resize', () => this.resize());
        }

        resize() {
          this.canvas.width = window.innerWidth;
          this.canvas.height = window.innerHeight;
        }

        init() {
          // Tạo nhiều sao băng ban đầu hơn
          for (let i = 0; i < 6; i++) {
            this.createShootingStar();
          }
        }

        createShootingStar() {
          const star = {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height * 0.3, // Chỉ xuất hiện ở phần trên
            vx: (Math.random() - 0.5) * 8 + 2, // Tốc độ ngang
            vy: Math.random() * 3 + 2, // Tốc độ dọc
            life: 1.0,
            decay: Math.random() * 0.02 + 0.005,
            size: Math.random() * 4 + 2, // Tăng kích thước từ 1-3 lên 2-6
            trail: []
          };
          this.stars.push(star);
        }

        update() {
          for (let i = this.stars.length - 1; i >= 0; i--) {
            const star = this.stars[i];

            // Lưu vị trí cũ cho trail
            star.trail.push({ x: star.x, y: star.y });
            if (star.trail.length > 20) {
              star.trail.shift();
            }

            // Cập nhật vị trí
            star.x += star.vx;
            star.y += star.vy;
            star.life -= star.decay;

            // Xóa sao băng khi hết life hoặc ra khỏi màn hình
            if (star.life <= 0 || star.x > this.canvas.width || star.y > this.canvas.height) {
              this.stars.splice(i, 1);
            }
          }

          // Tạo sao băng mới ngẫu nhiên (tăng tần suất từ 0.02 lên 0.05)
          if (Math.random() < 0.05) {
            this.createShootingStar();
          }
        }

        draw() {
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

          for (const star of this.stars) {
            // Vẽ trail
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${star.life * 0.3})`;
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            for (let i = 0; i < star.trail.length - 1; i++) {
              const alpha = (i / star.trail.length) * star.life * 0.3;
              this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
              this.ctx.lineWidth = (i / star.trail.length) * 2 + 0.5;
              this.ctx.beginPath();
              this.ctx.moveTo(star.trail[i].x, star.trail[i].y);
              this.ctx.lineTo(star.trail[i + 1].x, star.trail[i + 1].y);
              this.ctx.stroke();
            }

            // Vẽ sao băng chính
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.life})`;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();

            // Vẽ hiệu ứng sáng
            const gradient = this.ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 3);
            gradient.addColorStop(0, `rgba(255, 255, 255, ${star.life * 0.8})`);
            gradient.addColorStop(0.5, `rgba(255, 255, 255, ${star.life * 0.3})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
            this.ctx.fill();
          }
        }

        animate() {
          this.update();
          this.draw();
          requestAnimationFrame(() => this.animate());
        }
      }

      // Khởi tạo hiệu ứng sao băng khi trang load
      window.addEventListener('load', () => {
        const canvas = document.getElementById('shooting-stars-canvas');
        new ShootingStar(canvas);
      });

