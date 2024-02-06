/// <reference types="@workadventure/iframe-api-typings" />

import { ActionMessage } from "@workadventure/iframe-api-typings";
import { bootstrapExtra } from "@workadventure/scripting-api-extra";

console.log('Script started successfully');

const FLOOR_DATA = {
    "0": {
        url: "/@/philipps-universitaet-marburg/eupeace-academic-kick-off/floor0#from-elevator"
    },
    "-1": {
        url: "/@/philipps-universitaet-marburg/eupeace-academic-kick-off/floor-1#from-elevator"
    },
    "-2": {
        url: "/@/philipps-universitaet-marburg/eupeace-academic-kick-off/floor-2#from-elevator"
    },
    "-3": {
        url: "/@/philipps-universitaet-marburg/eupeace-academic-kick-off/floor-3#from-elevator"
    },
    "-4": {
        url: "/@/philipps-universitaet-marburg/eupeace-academic-kick-off/floor-4#from-elevator"
    },
    "-5": {
        url: "/@/philipps-universitaet-marburg/eupeace-academic-kick-off/floor-5#from-elevator"
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
