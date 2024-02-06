/// <reference types="@workadventure/iframe-api-typings" />

console.info('"Elevator" script started successfully')

const FLOOR_DATA = {
    "0": {
        tablesRange: ["1", "15"],
        exitCoord: [54, 20],
    },
    "-1": {
        tablesRange: ["16", "41"],
        exitCoord: [42, 15],
    },
    "-2": {
        tablesRange: ["42", "67"],
        exitCoord: [42, 15],
    },
    "-3": {
        tablesRange: ["68", "93"],
        exitCoord: [42, 15],
    },
    "-4": {
        tablesRange: ["94", "119"],
        exitCoord: [42, 15],
    },
    "-5": {
        tablesRange: ["120", "145"],
        exitCoord: [42, 15],
    },
}

const TILES_SIZE = 32

WA.onInit().then(() => {
    $(document).ready(function() {
        console.info('"Elevator" init')
        const url = new URL(window.location.toString())
        const floor = url.searchParams.get("floor")

        class Elevator {
            constructor() {
                this.targetFloor = null;
                this.targetButton = null;
                this.currentFloor = Number(floor)
        
                //queue events - fire enQueue method when button clicked.
                this.queue = [];
                $('.floor-number').html(this.currentFloor)
                $('#tables-range-from').html(FLOOR_DATA[floor].tablesRange[0])
                $('#tables-range-to').html(FLOOR_DATA[floor].tablesRange[1])
                $('.button').on('click', this, this.enQueue)

                $('.button').on('mouseenter', function() {
                    const floorOnButton = $(this).text()
                    $('#details .floor-number').html(floorOnButton)
                    $('#tables-range-from').html(FLOOR_DATA[floorOnButton].tablesRange[0])
                    $('#tables-range-to').html(FLOOR_DATA[floorOnButton].tablesRange[1])
                })
            }

            //changeFloor - selects appropriate up/down indicator, writes updated floor on elevator panel and then turns off highlight on button.
            changeFloor(indicator) {
                //set indicator to initiate elevator motion (ignore case where user presses existing floor number)        
                if (indicator != '') {
                    // indicate direction 
                    $(indicator).animate({ opacity: 1 });
                }
        
                // establish operations (showing indicator, updating floor number, etc) to occur after floors have finished moving
                setTimeout(function () {
                    // set indicator
                    $(indicator).animate({ opacity: 0 }, 400);

                    // ELEVATOR STEP 4: prepare coordinates to move to
                    const xCoord = FLOOR_DATA[this.currentFloor].exitCoord[0] * TILES_SIZE
                    const yCoord = FLOOR_DATA[this.currentFloor].exitCoord[1] * TILES_SIZE

                    this.currentFloor = this.targetFloor;
        
                    // write current floor
                    $('#screen .floor-number').fadeOut(500, function () {
                        $('#screen .floor-number').html(this.currentFloor).fadeIn(500);
                        // unselect button
                        this.targetButton.removeClass('glow');
                    }.bind(this));

                    // ELEVATOR STEP 5: move to coordinates
                    setTimeout(() => {
                        WA.player.moveTo(xCoord, yCoord)
                    }, 1500)
                    this.targetFloor = null;

                    // check queue
                    this.targetButton.on('click', elevator, this.enQueue);
                    this.checkQueue();
        
                }.bind(this), 1000);               
            }

            // enQueue: Fired when button pressed, we highlight elevator button and then unselect button.
            enQueue(event) {
                let targetElevator = event.data;
                let button = $(this);
        
                // queue button press, add button highlight
                targetElevator.queue.push(button);
                button.addClass('glow');
                $(button).off('click');

                // disable button
                $(button).prop("disabled", true);
        
                // ELEVATOR STEP 1: disable player
                WA.controls.disablePlayerControls()
                WA.controls.disablePlayerProximityMeeting()

                // ELEVATOR STEP 2: open door
                WA.room.hideLayer('elevator/closed')
                WA.room.showLayer('elevator/open')
                WA.room.showLayer('elevator-above/open')

                // check queue
                targetElevator.checkQueue();
            }

            checkQueue() {
                if (this.queue.length && this.targetFloor === null) {
        
                    // check floor number
                    this.targetButton = this.queue.splice(0, 1)[0];
                    this.targetFloor = Number(this.targetButton.text());

                    // ELEVATOR STEP 3: save target floor
                    WA.player.state.targetFloor = this.targetFloor
        
                    // moving up
                    if (this.targetFloor > this.currentFloor) {
                        this.changeFloor('#up-indicator');
                    } else if (this.targetFloor < this.currentFloor) {
                        // moving down
                        this.changeFloor('#down-indicator');
                    } else {
                        //current floor re-selected - do nothing with indicator
                        this.changeFloor('');
                    }
                }
            }
        }

        let elevator = new Elevator()
    })
}).catch(e => console.error(e))

export {}