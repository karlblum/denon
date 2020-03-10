
var app = new Vue({
    el: '#app',
    data: {
        channels: [
            { "name": "Rock FM", "channelNumber": "12", "image": "rock-fm.png" },
            { "name": "Raadio 2", "channelNumber": "1", "image": "r2.png" },
            { "name": "Kuku", "channelNumber": "2", "image": "Raadio_Kuku.png" },
            { "name": "Sky+", "channelNumber": "4", "image": "Sky_Plus.png" },
            { "name": "Adore Jazz", "channelNumber": "5", "image": "adore.png" },
            { "name": "High Voltage", "channelNumber": "9", "image": "high_voltage.png" },
            { "name": "BBC Radio 1", "channelNumber": "10", "image": "BBC_Radio_1.svg" },
            { "name": "BBC Radio 2", "channelNumber": "11", "image": "BBC_Radio_2.svg" },
            { "name": "Vikerraadio", "channelNumber": "8", "image": "vikerraadio.png" }
        ],
        powerState: false,
        stateLoading: false,
        currentVolume: 4,
        volMax: 5
    },
    methods: {
        //https://learnwithparam.com/blog/how-to-handle-fetch-errors/
        //fetch vajab täiendamist
        changeChannel: function (channelNumber) {
            fetch('/api/favourite/' + channelNumber)
            console.log('Channel changed to: ' + channelNumber);
        },
        togglePower: function () {
            if (this.powerState) {
                console.log('Power OFF')
                fetch('/api/power/off')
            } else {
                console.log('Power ON')
                fetch('/api/power/on')
                this.stateLoading = true
            }
        },
        setVolume: function (value) {
            console.log("Trying to set volume: " + value)
            if (value > this.volMax) {
                value = this.volMax
            } else if (value < 0) {
                value = 0
            }
            fetch('/api/volume/' + value).then(response => response.json())
                .then((data) => this.currentVolume = data.volume);

        },
        loadData: function () {
            fetch('/api/power').then(response => response.json())
                .then((data) => this.powerState = data.power);

            if (this.powerState) {
                this.stateLoading = false

                fetch('/api/volume').then(response => response.json())
                    .then((data) => this.currentVolume = data.volume);
            }
        }
    },
    mounted: function () {
        this.loadData();
        setInterval(function () {
            this.loadData();
        }.bind(this), 4000);
    },
    vuetify: new Vuetify()
})