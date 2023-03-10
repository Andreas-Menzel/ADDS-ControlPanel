class DroneAltitudeApplet {

    #usualMaxAltitude = 50;

    #active;
    #chart;

    // List of drone IDs currently shown.
    #droneIds = [];


    constructor() {
        this.#active = false;
    }


    init() {
        // Just in case the DroneAltitudeApplet is re-initialized when it is
        // already active.
        this.#active = false;

        const canvas = document.getElementById('droneAltitudeApplet_chart');

        let config = {
            type: 'bar',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Altitude in meters.',
                        data: []
                    }
                ]
            },
            options: {
                maintainAspectRatio: false,
                scales: {
                    y: {
                        min: 0,
                        suggestedMax: this.#usualMaxAltitude
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

                    this.#chart.config.data.datasets[0].data[i] = drone.getAltitude();
                }
            } else {
                // Different drones
                this.#droneIds = Object.keys(drones);

                this.#chart.config.data.labels = [];
                
                this.#chart.config.data.datasets[0].data = [];

                for (const [_, drone] of Object.entries(drones)) {
                    this.#chart.config.data.labels.push(drone.getDroneId());
                    
                    this.#chart.config.data.datasets[0].data.push(drone.getAltitude());
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
