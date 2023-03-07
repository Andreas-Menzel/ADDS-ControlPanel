class DroneVelocityApplet {

    #usualMaxVelocity = 10;

    #active;
    #chart;

    // List of drone IDs currently shown.
    #droneIds = [];


    constructor() {
        this.#active = false;
    }


    init() {
        // Just in case the DroneVelocityApplet is re-initialized when it is
        // already active.
        this.#active = false;

        const canvas = document.getElementById('droneVelocityApplet_chart');

        let config = {
            type: 'bar',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Velocity X (North) in meters / second.',
                        data: []
                    },
                    {
                        label: 'Velocity Y (East) in meters / second.',
                        data: []
                    },
                    {
                        label: 'Velocity Z (Down) in meters / second.',
                        data: []
                    }
                ]
            },
            options: {
                indexAxis: 'y',
                scales: {
                    x: {
                        suggestedMin: -this.#usualMaxVelocity,
                        suggestedMax: this.#usualMaxVelocity
                    }
                }
            }
        };

        this.#chart = new Chart(canvas, config);

        this.#active = true;
    }


    update(drones) {
        if (this.#active) {
            let usualMaxVelocity = this.#usualMaxVelocity;

            if (this.#droneIds.join(',') === Object.keys(drones).join(',')) {
                // Same drones, different values
                for (let i = 0; i < Object.keys(drones).length; ++i) {
                    let droneId = Object.keys(drones)[i];
                    let drone = drones[droneId];

                    const velocityX = drone.getVelocityX();
                    const velocityY = drone.getVelocityY();
                    const velocityZ = drone.getVelocityZ();

                    this.#chart.config.data.datasets[0].data[i] = velocityX;
                    this.#chart.config.data.datasets[1].data[i] = velocityY;
                    this.#chart.config.data.datasets[2].data[i] = velocityZ;

                    if(Math.abs(velocityX) > usualMaxVelocity) usualMaxVelocity = Math.abs(velocityX);
                    if(Math.abs(velocityY) > usualMaxVelocity) usualMaxVelocity = Math.abs(velocityY);
                    if(Math.abs(velocityZ) > usualMaxVelocity) usualMaxVelocity = Math.abs(velocityZ);
                }
            } else {
                // Different drones
                this.#droneIds = Object.keys(drones);

                this.#chart.config.data.labels = [];

                this.#chart.config.data.datasets[0].data = [];
                this.#chart.config.data.datasets[1].data = [];
                this.#chart.config.data.datasets[2].data = [];

                for (const [_, drone] of Object.entries(drones)) {
                    this.#chart.config.data.labels.push(drone.getDroneId());

                    const velocityX = drone.getVelocityX();
                    const velocityY = drone.getVelocityY();
                    const velocityZ = drone.getVelocityZ();
                    
                    this.#chart.config.data.datasets[0].data.push(velocityX);
                    this.#chart.config.data.datasets[1].data.push(velocityY);
                    this.#chart.config.data.datasets[2].data.push(velocityZ);

                    if(Math.abs(velocityX) > usualMaxVelocity) usualMaxVelocity = Math.abs(velocityX);
                    if(Math.abs(velocityY) > usualMaxVelocity) usualMaxVelocity = Math.abs(velocityY);
                    if(Math.abs(velocityZ) > usualMaxVelocity) usualMaxVelocity = Math.abs(velocityZ);
                }
            }

            this.#chart.config.options.scales.x.suggestedMin = -usualMaxVelocity;
            this.#chart.config.options.scales.x.suggestedMax = usualMaxVelocity;

            this.#chart.update();
        }
    }


    isActive() {
        return this.#active;
    }

    deactivate() {
        this.#active = false;
    }

}
