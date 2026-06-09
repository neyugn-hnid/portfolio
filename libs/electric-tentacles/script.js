window.requestAnimFrame = function () {
    return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback);
        }
    );
};

function init(elemid) {
    let canvas = document.getElementById(elemid),
        c = canvas.getContext("2d"),
        w = (canvas.width = window.innerWidth),
        h = (canvas.height = window.innerHeight);
    c.fillStyle = "rgba(30,30,30,1)";
    c.fillRect(0, 0, w, h);
    return { c: c, canvas: canvas };
}

window.onload = function () {
    let c = init("electric-tentacles-el").c,
        canvas = init("electric-tentacles-el").canvas,
        w = (canvas.width = window.innerWidth),
        h = (canvas.height = window.innerHeight),
        mouse = { x: false, y: false },
        last_mouse = {};
    //initiation

    function dist(p1x, p1y, p2x, p2y) {
        return Math.sqrt(Math.pow(p2x - p1x, 2) + Math.pow(p2y - p1y, 2));
    }

    class segment {
        constructor(parent, l, a, first) {
            this.first = first;
            if (first) {
                this.pos = {
                    x: parent.x,
                    y: parent.y,
                };
            } else {
                this.pos = {
                    x: parent.nextPos.x,
                    y: parent.nextPos.y,
                };
            }
            this.l = l;
            this.ang = a;
            this.nextPos = {
                x: this.pos.x + this.l * Math.cos(this.ang),
                y: this.pos.y + this.l * Math.sin(this.ang),
            };
        }
        update(t) {
            // Tính góc từ vị trí hiện tại đến target
            this.ang = Math.atan2(t.y - this.pos.y, t.x - this.pos.x);
            
            // Tính vị trí mới dựa trên target và chiều dài segment
            this.pos.x = t.x + this.l * Math.cos(this.ang - Math.PI);
            this.pos.y = t.y + this.l * Math.sin(this.ang - Math.PI);
            
            // Tính vị trí tiếp theo
            this.nextPos.x = this.pos.x + this.l * Math.cos(this.ang);
            this.nextPos.y = this.pos.y + this.l * Math.sin(this.ang);
        }
        fallback(t) {
            this.pos.x = t.x;
            this.pos.y = t.y;
            this.nextPos.x = this.pos.x + this.l * Math.cos(this.ang);
            this.nextPos.y = this.pos.y + this.l * Math.sin(this.ang);
        }
        show() {
            c.lineTo(this.nextPos.x, this.nextPos.y);
        }
    }

    class tentacle {
        constructor(x, y, l, n, a) {
            this.x = x;
            this.y = y;
            this.l = l;
            this.n = n;
            this.t = {};
            this.rand = Math.random();
            this.segments = [new segment(this, this.l / this.n, 0, true)];
            for (let i = 1; i < this.n; i++) {
                this.segments.push(
                    new segment(this.segments[i - 1], this.l / this.n, 0, false)
                );
            }
        }
        move(last_target, target) {
            this.angle = Math.atan2(target.y - this.y, target.x - this.x);
            this.dt = dist(last_target.x, last_target.y, target.x, target.y) + 5;
            
            // Tăng khoảng cách đuổi theo để tạo hiệu ứng "không đuổi kịp"
            this.t = {
                x: target.x - 1.2 * this.dt * Math.cos(this.angle), // Từ 0.8 lên 1.2
                y: target.y - 1.2 * this.dt * Math.sin(this.angle),
            };
            
            // Thêm quán tính cho target để tạo hiệu ứng "không đuổi kịp"
            if (!this.smoothTarget) {
                this.smoothTarget = { x: this.t.x, y: this.t.y };
            }
            
            const inertia = 0.3; // Độ quán tính cho target
            this.smoothTarget.x += (this.t.x - this.smoothTarget.x) * inertia;
            this.smoothTarget.y += (this.t.y - this.smoothTarget.y) * inertia;
            
            //update first segment to follow smooth target
            if (this.smoothTarget.x) {
                this.segments[this.n - 1].update(this.smoothTarget);
            } else {
                this.segments[this.n - 1].update(target);
            }
            
            // Cập nhật các segment theo thứ tự từ cuối về đầu
            for (let i = this.n - 2; i >= 0; i--) {
                // Mỗi segment theo segment phía trước nó
                this.segments[i].update(this.segments[i + 1].pos);
            }
            
            if (
                dist(this.x, this.y, target.x, target.y) <=
                this.l + dist(last_target.x, last_target.y, target.x, target.y)
            ) {
                this.segments[0].fallback({ x: this.x, y: this.y });
                for (let i = 1; i < this.n; i++) {
                    this.segments[i].fallback(this.segments[i - 1].nextPos);
                }
            }
        }
        show(target) {
            if (dist(this.x, this.y, target.x, target.y) <= this.l) {
                c.globalCompositeOperation = "lighter";
                c.beginPath();
                c.lineTo(this.x, this.y);
                for (let i = 0; i < this.n; i++) {
                    this.segments[i].show();
                }
                // Hiệu ứng màu sắc dựa trên khoảng cách
                const distance = dist(this.x, this.y, target.x, target.y);
                const intensity = Math.max(0.3, 1 - distance / this.l); // Càng gần chuột càng sáng
                
                c.strokeStyle =
                    "hsl(" +
                    (this.rand * 60 + 180) +
                    ",100%," +
                    (this.rand * 60 + 25 + intensity * 20) + // Tăng độ sáng khi gần chuột
                    "%)";
                c.lineWidth = this.rand * 2;
                c.lineCap = "round";
                c.lineJoin = "round";
                c.stroke();
                c.globalCompositeOperation = "source-over";
            }
        }
        show2(target) {
            c.beginPath();
            if (dist(this.x, this.y, target.x, target.y) <= this.l) {
                c.arc(this.x, this.y, 2 * this.rand + 1, 0, 2 * Math.PI);
                c.fillStyle = "white";
            } else {
                c.arc(this.x, this.y, this.rand * 2, 0, 2 * Math.PI);
                c.fillStyle = "darkcyan";
            }
            c.fill();
        }
    }

    let maxl = 300,
        minl = 30,
        n = 30,
        numt = 500,
        tent = [],
        clicked = false,
        target = { x: 0, y: 0 },
        last_target = {},
        t = 0,
        q = 10;

    for (let i = 0; i < numt; i++) {
        tent.push(
            new tentacle(
                Math.random() * w,
                Math.random() * h,
                Math.random() * (maxl - minl) + minl,
                n,
                Math.random() * 2 * Math.PI
            )
        );
    }
    function draw() {
        //animation
        if (mouse.x) {
            target.errx = mouse.x - target.x;
            target.erry = mouse.y - target.y;
        } else {
            target.errx =
                w / 2 +
                ((h / 2 - q) * Math.sqrt(2) * Math.cos(t)) /
                (Math.pow(Math.sin(t), 2) + 1) -
                target.x;
            target.erry =
                h / 2 +
                ((h / 2 - q) * Math.sqrt(2) * Math.cos(t) * Math.sin(t)) /
                (Math.pow(Math.sin(t), 2) + 1) -
                target.y;
        }

        // Giảm tốc độ đuổi theo để tạo hiệu ứng "không đuổi kịp"
        target.x += target.errx / 25; // Từ 10 xuống 25 - chậm hơn
        target.y += target.erry / 25;

        t += 0.01;

        c.beginPath();
        c.arc(
            target.x,
            target.y,
            dist(last_target.x, last_target.y, target.x, target.y) + 5,
            0,
            2 * Math.PI
        );
        c.fillStyle = "hsl(210,100%,80%)";
        c.fill();

        for (i = 0; i < numt; i++) {
            tent[i].move(last_target, target);
            tent[i].show2(target);
        }
        for (i = 0; i < numt; i++) {
            tent[i].show(target);
        }
        last_target.x = target.x;
        last_target.y = target.y;
    }

    // Thêm event listener vào document vì canvas có pointer-events: none
    document.addEventListener(
        "mousemove",
        function (e) {
            last_mouse.x = mouse.x;
            last_mouse.y = mouse.y;

            mouse.x = e.pageX;
            mouse.y = e.pageY;
        },
        false
    );

    // Không cần mouseleave vì document luôn có chuột
    // canvas.addEventListener("mouseleave", function (e) {
    //     mouse.x = false;
    //     mouse.y = false;
    // });

    document.addEventListener(
        "mousedown",
        function (e) {
            clicked = true;
        },
        false
    );

    document.addEventListener(
        "mouseup",
        function (e) {
            clicked = false;
        },
        false
    );

    function loop() {
        window.requestAnimFrame(loop);
        c.clearRect(0, 0, w, h);
        draw();
    }

    window.addEventListener("resize", function () {
        (w = canvas.width = window.innerWidth),
            (h = canvas.height = window.innerHeight);
        loop();
    });

    loop();
    setInterval(loop, 1000 / 60);
};