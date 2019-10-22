/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

import {toArray} from "../utils";
import {addSVGHandler, DefaultSVGHandler} from "./SVGDocumentWrapper";

export class AiHandler extends DefaultSVGHandler {

    static matches(svgRoot) {
        return /^http:\/\/ns.adobe.com\/AdobeIllustrator/.test(svgRoot.getAttribute("xmlns:i")) &&
               toArray(svgRoot.childNodes).some(svgNode => svgNode instanceof SVGSwitchElement);
    }

    static transform(svgRoot) {
        for (let svgSwitch of toArray(svgRoot.getElementsByTagName("switch"))) {
            // Remove first foreignObject child node
            const svgForeignObject = svgSwitch.firstElementChild;
            if (svgForeignObject && svgForeignObject instanceof SVGForeignObjectElement &&
                svgForeignObject.hasAttribute("requiredExtensions") &&
                svgForeignObject.getAttribute("requiredExtensions").startsWith("http://ns.adobe.com/AdobeIllustrator")) {
                // Remove foreign objet element
                svgSwitch.removeChild(svgForeignObject);

                // Unwrap main group
                let svgGroup = svgSwitch.firstElementChild;
                if (!svgGroup || svgGroup instanceof SVGGElement || svgGroup.getAttribute("i:extraneous") !== "self") {
                    svgGroup = svgSwitch;
                }
                for (let childNode of toArray(svgGroup.childNodes)) {
                    svgSwitch.parentNode.insertBefore(childNode, svgSwitch);
                }

                // Remove switch element
                svgSwitch.parentNode.removeChild(svgSwitch);
            }
        }
    }

    static isLayer(svgElement) {
        return svgElement.getAttribute("i:layer") === "yes";
    }
}

addSVGHandler("Adobe Illustrator", AiHandler);
