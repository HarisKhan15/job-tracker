package com.haris.jobtracker.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * The Angular build is served from /static. Refreshing the browser on an
 * Angular route (e.g. /login) must still return index.html.
 */
@Controller
public class SpaController {

    @GetMapping({"/login", "/applications", "/applications/**"})
    public String forward() {
        return "forward:/index.html";
    }
}
