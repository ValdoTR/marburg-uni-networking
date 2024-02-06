/// <reference types="@workadventure/iframe-api-typings" />

import { ActionMessage } from "@workadventure/iframe-api-typings";
import { bootstrapExtra } from "@workadventure/scripting-api-extra";

console.log('Script started successfully');

const FLOOR_DATA = {
    "0": {
        url: "./map.tmj#from-elevator"
    },
    "-1": {
        url: "./floor-1.tmj#from-elevator"
    },
    "-2": {
        url: "./floor-2.tmj#from-elevator"
    },
    "-3": {
        url: "./floor-3.tmj#from-elevator"
    },
    "-4": {
        url: "./floor-4.tmj#from-elevator"
    },
    "-5": {
        url: "./floor-5.tmj#from-elevator"
    },
}

// Waiting for the API to be ready
WA.onInit().then(() => {
    console.log('Scripting API ready');
    console.log('Player tags: ',WA.player.tags)

    let triggerMessage: ActionMessage|null
    let modal: any
    const mapUrl = WA.room.mapURL
    const root = mapUrl.substring(0, mapUrl.lastIndexOf("/"))

    // The line below bootstraps the Scripting API Extra library that adds a number of advanced properties/features to WorkAdventure
    bootstrapExtra().then(() => {
        console.log('Scripting API Extra ready');

        const floor = WA.state.loadVariable('floor') as number

        // ELEVATOR STEP 0: open elevator UI
        WA.room.area.onEnter('elevator-controls').subscribe(() => {
            triggerMessage = WA.ui.displayActionMessage({
                message: 'Press SPACE or touch here to use the elevator',
                callback: async () => {
                    modal = WA.ui.modal.openModal({
                        title: 'Elevator',
                        src: root + `/elevator/index.html?floor=${floor}`,
                        allowApi: true,
                        allow: "microphone; camera;",
                        position: "right",
                    }, () => WA.ui.modal.closeModal())
                }
            })
        })

        WA.room.area.onLeave('elevator-controls').subscribe(() => {
            triggerMessage?.remove()
            triggerMessage = null

            WA.ui.modal.closeModal()
            modal = null
        })

        // ELEVATOR STEP 6: go to target floor
        WA.room.area.onEnter('inside-elevator').subscribe(() => {
            const targetFloor = WA.player.state.targetFloor as string

            if (targetFloor != null) {
                const targetUrl = FLOOR_DATA[targetFloor as keyof typeof FLOOR_DATA].url

                WA.controls.restorePlayerControls()
                WA.controls.restorePlayerProximityMeeting()
                WA.nav.goToRoom(targetUrl)
            }
        })

    }).catch(e => console.error(e));
}).catch(e => console.error(e));

export {};
