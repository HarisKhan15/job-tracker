package com.haris.jobtracker;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:test;DB_CLOSE_DELAY=-1",
        "app.username=test",
        "app.password=secret"
})
class JobApplicationApiTest {

    @Autowired
    MockMvc mvc;

    @Test
    void rejectsWithoutLogin() throws Exception {
        mvc.perform(get("/api/applications")).andExpect(status().isUnauthorized());
    }

    @Test
    void createListAndChangeStatus() throws Exception {
        String body = """
                {"company":"Deutsche Bahn","position":"Werkstudent Java Backend","type":"WERKSTUDENT"}
                """;
        mvc.perform(post("/api/applications").with(httpBasic("test", "secret"))
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("APPLIED"))
                .andExpect(jsonPath("$.appliedDate").exists());

        mvc.perform(get("/api/applications").with(httpBasic("test", "secret")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].company").value("Deutsche Bahn"));

        mvc.perform(patch("/api/applications/1/status").with(httpBasic("test", "secret"))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"INTERVIEW\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("INTERVIEW"));

        mvc.perform(get("/api/applications/stats").with(httpBasic("test", "secret")))
                .andExpect(jsonPath("$.INTERVIEW").value(1));
    }
}
