class DroneVelocityApplet {

    #usualMaxVelocity = 7;

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
            if (this.#droneIds.join(',') === Object.keys(drones).join(',')) {
                // Same drones, different values
                for (let i = 0; i < Object.keys(drones).length; ++i) {
                    let droneId = Object.keys(drones)[i];
                    let drone = drones[droneId];

                    this.#chart.config.data.datasets[0].data[i] = drone.getVelocityX();
                    this.#chart.config.data.datasets[1].data[i] = drone.getVelocityY();
                    this.#chart.config.data.datasets[2].data[i] = drone.getVelocityZ();
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
                    
                    this.#chart.config.data.datasets[0].data.push(drone.getVelocityX());
                    this.#chart.config.data.datasets[1].data.push(drone.getVelocityY());
                    this.#chart.config.data.datasets[2].data.push(drone.getVelocityZ());
                }
            }

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
