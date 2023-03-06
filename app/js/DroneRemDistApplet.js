class DroneRemDistApplet {

    #active;
    #chart;

    // List of drone IDs currently shown.
    #droneIds = [];


    constructor() {
        this.#active = false;
    }


    init() {
        // Just in case the DroneRemDistApplet is re-initialized when it is
        // already active.
        this.#active = false;

        const canvas = document.getElementById('droneRemDistApplet_chart');

        let config = {
            type: 'bar',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Remaining flight radius in km.',
                        data: []
                    }
                ]
            },
            options: {
                scales: {
                    y: {
                        min: 0,
                        suggestedMax: 10
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

                    const droneRemDist = drone.getRemainingFlightRadius() / 1000;
                    this.#chart.config.data.datasets[0].data[i] = droneRemDist;

                    if(droneRemDist < 1) {
                        this.#chart.config.data.datasets[0].backgroundColor[i] = 'rgba(220, 20, 60, 0.5)'; // Crimston
                        this.#chart.config.data.datasets[0].borderColor[i] = 'rgba(178, 34, 34, 0.5)'; // FireBrick
                    } else if(droneRemDist < 2) {
                        this.#chart.config.data.datasets[0].backgroundColor[i] = 'rgba(255, 165, 0, 0.5)'; // Orange
                        this.#chart.config.data.datasets[0].borderColor[i] = 'rgba(255, 69, 0, 0.5)'; // OrangeRed
                    } else {
                        this.#chart.config.data.datasets[0].backgroundColor[i] = 'rgba(50, 205, 50, 0.5)'; // LimeGreen
                        this.#chart.config.data.datasets[0].borderColor[i] = 'rgba(46, 139, 87, 0.5)'; // SeaGreen
                    }
                }
            } else {
                // Different drones
                this.#droneIds = Object.keys(drones);

                this.#chart.config.data.labels = [];
                
                this.#chart.config.data.datasets[0].data = [];
                this.#chart.config.data.datasets[0].backgroundColor = [];
                this.#chart.config.data.datasets[0].borderWidth = [];
                this.#chart.config.data.datasets[0].borderColor = [];

                for (const [_, drone] of Object.entries(drones)) {
                    this.#chart.config.data.labels.push(drone.getDroneId());
                    
                    const droneRemDist = drone.getRemainingFlightRadius() / 1000;
                    this.#chart.config.data.datasets[0].data.push(droneRemDist);

                    this.#chart.config.data.datasets[0].borderWidth.push(3);

                    if(droneRemDist < 1) {
                        this.#chart.config.data.datasets[0].backgroundColor.push('rgba(220, 20, 60, 0.5)'); // Crimston
                        this.#chart.config.data.datasets[0].borderColor.push('rgba(178, 34, 34, 0.5)'); // FireBrick
                    } else if(droneRemDist < 2) {
                        this.#chart.config.data.datasets[0].backgroundColor.push('rgba(255, 165, 0, 0.5)'); // Orange
                        this.#chart.config.data.datasets[0].borderColor.push('rgba(255, 69, 0, 0.5)'); // OrangeRed
                    } else {
                        this.#chart.config.data.datasets[0].backgroundColor.push('rgba(50, 205, 50, 0.5)'); // LimeGreen
                        this.#chart.config.data.datasets[0].borderColor.push('rgba(46, 139, 87, 0.5)'); // SeaGreen
                    }
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
