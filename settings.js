window.onload = function() {
    config.load_data();
    translator.translate_ui();
    
    show_options();
    setup_backup_button();
};



function show_options() {
    var language_input = document.querySelector("[name='language_input']");
    language_input.value = config.data.language;
    
    show_color_options();
    show_periods_options();
    show_timetable_options();
    
    
    
    function show_periods_options() {
        var periods_settings_group = document.getElementById("periods_settings_group");
        var add_input_group_button = document.createElement("button");
        
        add_input_group_button.innerText = translator.translate("add");
        add_input_group_button.onclick = function() {
            add_input_group("", "");
        };
        
        periods_settings_group.append(add_input_group_button);
        
        for (period of config.data.periods) {
            add_input_group(period.start, period.end);
        }
        
        function add_input_group(start, end) {
            var periods_input_groups_container = document.getElementById("periods_input_groups_container");
            
            periods_input_groups_container.innerHTML += 
                "<div class='input_group'>" + 
                    `<input type='time' value='${start}'/>` +
                    `<input type='time' value='${end}'/>` +
                    "<button class='negative' onclick='this.parentElement.remove();'>X</button>" +
                "</div>";
        }
    }
    
    
    
    function show_timetable_options() {
        var timetable_settings_group = document.getElementById("timetable_settings_group");
        
        for (day_object of config.data.timetable) {            
            timetable_settings_group.innerHTML += 
                "<div class='input_group'>" + 
                    `<input name='day_name_input' value='${day_object.day}'/>` + 
                "</div>";
            
            
            var schedule_inputs_container = document.createElement("div");
            schedule_inputs_container.classList.add("schedule_inputs_container");
            
            
            for (var i = 0; i < config.data.periods.length; i++) {
                try {
                    add_period_input_group(day_object.schedule[i].subject, day_object.schedule[i].room);
                }
                catch (TypeError) {
                    add_period_input_group("", "");
                }
            }
            
            timetable_settings_group.append(schedule_inputs_container);
        }
        
        
        function add_period_input_group(subject, room) {
            schedule_inputs_container.innerHTML += 
                "<div class='input_group'>" +
                    `<input value='${subject}'/>` +
                    `<input value='${room}'/>` +
                "</div>"; 
        }
    }
    
    
    
    function show_color_options() {
        var color_settings_group = document.getElementById("color_settings_group");
        var color_input_groups_container = document.getElementById("color_input_groups_container");
        
        var subjects_list = [];
        
        for (day of config.data.timetable) {
            for (period of day.schedule) {
                if (subjects_list.indexOf(period.subject) < 0 && period.subject != "") {
                    subjects_list.push(period.subject);
                }
            }
        }
        
        for (subject of subjects_list) {
            var color = config.data.colors[subject];
        
            color_input_groups_container.innerHTML += 
                "<div class='input_group'>" +
                    `<label>${subject}</label>` +
                    `<input type='color' value='${typeof(color) == "undefined" ? "#000" : color}'`+
                "</div>";
        }
    }
}




function setup_backup_button() {
    var data_string = JSON.stringify(config.data);
    var data_uri = "data:application/json; charset=utf-8," + encodeURIComponent(data_string);
        
    var file_name = "timetable_data_backup.json";
        
    var link_element = document.getElementById("backup_button").parentElement;
    link_element.setAttribute("href", data_uri);
    link_element.setAttribute("download", file_name);
}






function restore() {
    alert("Sorry, this feature hasn't been implemented yet.");
}
function reset() {
    if (confirm(translator.translate("reset_confirm"))) {
        config.reset_data();
    }
}





var save = {
    general: function() {
        var language_input_value = document.querySelector("[name='language_input']").value;
        config.data.language = language_input_value;
    
        config.save_data(config.data);
        alert("General settings have been saved. Changes will take effect after page refresh.");
    },
    
    
    periods: function() {
        var periods_settings_input_groups = document.querySelectorAll("#periods_input_groups_container > .input_group");
        var new_periods = [];
    
        for (input_group of periods_settings_input_groups) {
            var inputs = input_group.getElementsByTagName("input");
            var period = {};
            
            period.start = inputs[0].value;
            period.end = inputs[1].value;
            new_periods.push(period);
        }
    
        config.data.periods = new_periods;
    
        config.save_data(config.data);
        alert("Periods settings have been saved. Changes will take effect after page refresh.");
    },
    
    
    timetable: function() {
        var day_name_inputs = document.querySelectorAll("#timetable_settings_group [name='day_name_input']");
        var schedule_input_group_containers = document.querySelectorAll("#timetable_settings_group > .schedule_inputs_container");
    
        if (day_name_inputs.length != schedule_input_group_containers.length) {
            alert("Error saving timetable settings");
            return false;
        }
    
    
        var new_timetable = [];
    
        for (var i = 0; i < day_name_inputs.length; i++) {
            var schedule_input_groups = schedule_input_group_containers[i].getElementsByClassName("input_group");
    
            var new_timetable_day = {
                day: day_name_inputs[i].value,
                schedule: []
            }
        
            for (input_group of schedule_input_groups) {
                var subject = input_group.children[0].value;
                var room = input_group.children[1].value;
            
                new_timetable_day.schedule.push({
                    "subject": subject,
                    "room": room,
                });
            }
        
            new_timetable.push(new_timetable_day);
        }
    
        config.data.timetable = new_timetable;
        config.save_data(config.data);
        alert("Timetable settings have been saved. Changes will take effect after page refresh.");
    },
    
    
    colors: function() {
        var color_settings_input_groups = document.querySelectorAll("#color_input_groups_container > .input_group");
        var new_colors = {};
        
        for (input_group of color_settings_input_groups) {
            var label = input_group.getElementsByTagName("label")[0];
            var input = input_group.getElementsByTagName("input")[0];
            
            new_colors[label.innerText] = input.value;
        }
    
        config.data.colors = new_colors;
    
        config.save_data(config.data);
        alert("Color settings have been saved. Changes will take effect after page refresh.");
    },
};





function toggle_settings_group_state(clicked_button) {
    var parent_settings_group = clicked_button.parentElement.parentElement;
    
    if (parent_settings_group.classList.contains("closed")) {
        parent_settings_group.classList.remove("closed");
        clicked_button.classList.remove("icon-arrow-down");
        clicked_button.classList.add("icon-arrow-up");
    }
    else {
        parent_settings_group.classList.add("closed");
        clicked_button.classList.remove("icon-arrow-up");
        clicked_button.classList.add("icon-arrow-down");
    }
}