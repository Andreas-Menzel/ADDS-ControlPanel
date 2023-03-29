class DroneVelocityApplet {

    #usualMaxVelocity = 15;

    #unit = 'm/s';

    #system = 'NED';

    #active;
    #chart;

    // List of drones currently shown.
    #drones = [];


    constructor() {
        this.#active = false;
    }


    init() {
        this.#initControlPanel();
        this.#initChart();
    }

    #initControlPanel() {
        const updateLabels = () => {
            if (this.#system == 'NED') {
                this.#chart.config.data.datasets[0].label = 'Velocity X (North) in ' + this.#unit;
                this.#chart.config.data.datasets[1].label = 'Velocity Y (East) in ' + this.#unit;
                this.#chart.config.data.datasets[2].label = 'Velocity Z (Down) in ' + this.#unit;
            } else {
                this.#chart.config.data.datasets[0].label = 'Velocity X (North) in ' + this.#unit;
                this.#chart.config.data.datasets[1].label = 'Velocity Y (West) in ' + this.#unit;
                this.#chart.config.data.datasets[2].label = 'Velocity Z (Up) in ' + this.#unit;
            }
            this.#chart.config.data.datasets[3].label = 'Combined velocity in ' + this.#unit;
        };

        const droneVelocityApplet = document.getElementById('droneVelocityApplet');
        const btnChangeSystem = droneVelocityApplet.getElementsByClassName('btnChangeSystem')[0];
        const btnChangeUnit = droneVelocityApplet.getElementsByClassName('btnChangeUnit')[0];

        const updateButtonTextSwitchNEDNWU = () => {
            if (this.#system == 'NED') {
                btnChangeSystem.innerHTML = 'Switch to NWU';
            } else {
                btnChangeSystem.innerHTML = 'Switch to NED';
            }
        }
        const updateButtonTextmskmh = () => {
            if (this.#unit == 'km/h') {
                btnChangeUnit.innerHTML = 'Switch to m/s';
            } else {
                btnChangeUnit.innerHTML = 'Switch to km/h';
            }
        }

        updateButtonTextSwitchNEDNWU();
        updateButtonTextmskmh();

        btnChangeSystem.addEventListener('click', () => {
            if (this.#system == 'NED') {
                this.#system = 'NWU';
            } else {
                this.#system = 'NED';
            }
            updateButtonTextSwitchNEDNWU();

            updateLabels();

            this.update(this.#drones);
        });

        btnChangeUnit.addEventListener('click', () => {
            if (this.#unit == 'km/h') {
                this.#unit = 'm/s';
            } else {
                this.#unit = 'km/h';
            }
            updateButtonTextmskmh();

            updateLabels();

            this.update(this.#drones);
        });
    }

    #initChart() {
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
                        label: 'Velocity X (North) in ' + this.#unit,
                        data: []
                    },
                    {
                        label: 'Velocity Y (East) in ' + this.#unit,
                        data: []
                    },
                    {
                        label: 'Velocity Z (Down) in ' + this.#unit,
                        data: []
                    },
                    {
                        label: 'Combined velocity in ' + this.#unit,
                        data: []
                    }
                ]
            },
            options: {
                maintainAspectRatio: false,
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
            if (this.#unit == 'km/h') {
                usualMaxVelocity *= 3.6;
            }

            if (Object.keys(this.#drones).join(',') === Object.keys(drones).join(',')) {
                // Same drones, different values
                for (let i = 0; i < Object.keys(drones).length; ++i) {
                    let droneId = Object.keys(drones)[i];
                    let drone = drones[droneId];

                    let velocityX = drone.getVelocityX();
                    let velocityY = drone.getVelocityY();
                    let velocityZ = drone.getVelocityZ();

                    if (this.#unit == 'km/h') {
                        velocityX *= 3.6;
                        velocityY *= 3.6;
                        velocityZ *= 3.6;
                    }

                    if (this.#system == 'NWU') {
                        velocityY *= -1;
                        velocityZ *= -1;
                    }

                    const combinedVelocity = Math.sqrt(Math.pow(velocityX, 2) + Math.pow(velocityY, 2), Math.pow(velocityZ, 2));

                    this.#chart.config.data.datasets[0].data[i] = velocityX;
                    this.#chart.config.data.datasets[1].data[i] = velocityY;
                    this.#chart.config.data.datasets[2].data[i] = velocityZ;
                    this.#chart.config.data.datasets[3].data[i] = combinedVelocity;

                    if (Math.abs(velocityX) > usualMaxVelocity) usualMaxVelocity = Math.abs(velocityX);
                    if (Math.abs(velocityY) > usualMaxVelocity) usualMaxVelocity = Math.abs(velocityY);
                    if (Math.abs(velocityZ) > usualMaxVelocity) usualMaxVelocity = Math.abs(velocityZ);
                    if (Math.abs(combinedVelocity) > usualMaxVelocity) usualMaxVelocity = Math.abs(combinedVelocity);
                }
            } else {
                // Different drones
                this.#drones = drones;

                this.#chart.config.data.labels = [];

                this.#chart.config.data.datasets[0].data = [];
                this.#chart.config.data.datasets[1].data = [];
                this.#chart.config.data.datasets[2].data = [];
                this.#chart.config.data.datasets[3].data = [];

                for (const [_, drone] of Object.entries(drones)) {
                    this.#chart.config.data.labels.push(drone.getDroneId());

                    let velocityX = drone.getVelocityX();
                    let velocityY = drone.getVelocityY();
                    let velocityZ = drone.getVelocityZ();

                    if (this.#unit == 'km/h') {
                        velocityX *= 3.6;
                        velocityY *= 3.6;
                        velocityZ *= 3.6;
                    }

                    if (this.#system == 'NWU') {
                        velocityY *= -1;
                        velocityZ *= -1;
                    }

                    const combinedVelocity = Math.sqrt(Math.pow(velocityX, 2) + Math.pow(velocityY, 2), Math.pow(velocityZ, 2));

                    this.#chart.config.data.datasets[0].data.push(velocityX);
                    this.#chart.config.data.datasets[1].data.push(velocityY);
                    this.#chart.config.data.datasets[2].data.push(velocityZ);
                    this.#chart.config.data.datasets[3].data.push(combinedVelocity);

                    if (Math.abs(velocityX) > usualMaxVelocity) usualMaxVelocity = Math.abs(velocityX);
                    if (Math.abs(velocityY) > usualMaxVelocity) usualMaxVelocity = Math.abs(velocityY);
                    if (Math.abs(velocityZ) > usualMaxVelocity) usualMaxVelocity = Math.abs(velocityZ);
                    if (Math.abs(combinedVelocity) > usualMaxVelocity) usualMaxVelocity = Math.abs(combinedVelocity);
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
