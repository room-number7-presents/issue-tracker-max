package org.presents.issuetracker.milestone.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.presents.issuetracker.milestone.dto.response.MilestoneResponse;
import org.presents.issuetracker.milestone.entity.Milestone;
import org.presents.issuetracker.milestone.entity.vo.MilestoneInfo;
import org.presents.issuetracker.milestone.entity.vo.MilestonePreview;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class MilestoneRepository {
    private static final String OPEN_FLAG = "open";
    private static final String CLOSED_FLAG = "closed";
    private static final int NOT_DELETED_FLAG = 0;
    private static final int DELETED_FLAG = 1;

    private final NamedParameterJdbcTemplate jdbcTemplate;

    private final RowMapper<MilestonePreview> milestonePreviewRowMapper =
            (rs, rowNum) -> MilestonePreview.builder()
                    .id(rs.getLong("milestone_id"))
                    .name(rs.getString("name"))
                    .progress(rs.getInt("progress"))
                    .build();

    public MilestonePreview findByIssueId(Long issueId) {
        final String sql = "SELECT m.milestone_id, m.name, "
                + "(SELECT FLOOR(COUNT(CASE WHEN status = 'closed' THEN 1 END) / COUNT(*) * 100) "
                + "FROM issue "
                + "WHERE milestone_id = i.milestone_id AND status IN ('open', 'closed')) progress "
                + "FROM milestone m JOIN issue i ON m.milestone_id = i.milestone_id "
                + "WHERE i.issue_id = :issueId";

        MapSqlParameterSource params = new MapSqlParameterSource("issueId", issueId);

        return jdbcTemplate.query(sql, params, milestonePreviewRowMapper)
                .stream()
                .findFirst()
                .orElse(null);
    }

    public Milestone findById(Long milestoneId) {
        final String sql = "SELECT milestone_id, name, deadline, description, status FROM milestone WHERE milestone_id = :id";

        MapSqlParameterSource params = new MapSqlParameterSource("id", milestoneId);

        RowMapper<Milestone> mapper = (rs, rowNum) -> Milestone.of(
                rs.getLong("milestone_id"),
                rs.getString("name"),
                rs.getTimestamp("deadLine").toLocalDateTime(),
                rs.getString("description"),
                rs.getString("status")
        );

        return jdbcTemplate.queryForObject(sql, params, mapper);
    }

    public List<MilestonePreview> findPreviews() {
        final String sql = "SELECT milestone_id, name, "
                + "(SELECT IFNULL(FLOOR(COUNT(CASE WHEN status = 'closed' THEN 1 END) / COUNT(*) * 100), 0) "
                + "FROM issue i "
                + "WHERE i.milestone_id = m.milestone_id AND status IN ('open', 'closed')) progress "
                + "FROM milestone m "
                + "WHERE status != 'deleted'";

        return jdbcTemplate.query(sql, milestonePreviewRowMapper);
    }

    public MilestoneInfo findDetailsByStatus(String status) {
        final String sql = "SELECT milestone_id, name, deadline, description, status " +
                "FROM milestone " +
                "WHERE status = :status " +
                "AND is_deleted = :not_deleted_flag " +
                "ORDER BY milestone_id";

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("status", status)
                .addValue("not_deleted_flag", NOT_DELETED_FLAG)
                .addValue("open_flag", OPEN_FLAG)
                .addValue("closed_flag", CLOSED_FLAG);

        List<MilestoneResponse> milestoneResponses = jdbcTemplate.query(sql, params, (rs, rowNum) -> {
            Long id = rs.getLong("milestone_id");
            String name = rs.getString("name");
            LocalDateTime deadline = rs.getTimestamp("deadline").toLocalDateTime();
            String description = rs.getString("description");
            return MilestoneResponse.of(id, name, deadline, description, status);
        });

        int labelCount = jdbcTemplate.queryForObject(
                "SELECT COALESCE(COUNT(*), 0) FROM label WHERE is_deleted = :not_deleted_flag",
                params,
                Integer.class
        );

        int openMilestoneCount = jdbcTemplate.queryForObject(
                "SELECT COALESCE(COUNT(*), 0) FROM milestone WHERE status = :open_flag AND is_deleted = :not_deleted_flag",
                params,
                Integer.class
        );

        int closedMilestoneCount = jdbcTemplate.queryForObject(
                "SELECT COALESCE(COUNT(*), 0) FROM milestone WHERE status = :closed_flag AND is_deleted = :not_deleted_flag",
                params,
                Integer.class
        );

        int totalMilestoneCount = openMilestoneCount + closedMilestoneCount;

        return MilestoneInfo.builder()
                .labelCount(labelCount)
                .milestoneCount(totalMilestoneCount)
                .openMilestoneCount(openMilestoneCount)
                .closedMilestoneCount(closedMilestoneCount)
                .milestoneResponses(milestoneResponses)
                .build();
    }

    public Long save(Milestone milestone) {
        final String sql = "INSERT INTO milestone(name, deadline, description) VALUES (:name, :deadline, :description)";

        MapSqlParameterSource params = new MapSqlParameterSource();
        params.addValue("name", milestone.getName());
        params.addValue("deadline", milestone.getDeadline());
        params.addValue("description", milestone.getDescription());

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(sql, params, keyHolder);

        return keyHolder.getKey().longValue();
    }

    public void update(Milestone milestone) {
        final String sql = "UPDATE milestone " +
                "SET name = :name, " +
                "deadline = :deadline, " +
                "description = :description " +
                "WHERE milestone_id = :id";

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("name", milestone.getName())
                .addValue("deadline", milestone.getDeadline())
                .addValue("description", milestone.getDescription())
                .addValue("id", milestone.getId());

        jdbcTemplate.update(sql, params);
    }

    public void updateStatus(Long id, String status) {
        final String sql = "UPDATE milestone SET status = :status WHERE milestone_id = :id";

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("status", status)
                .addValue("id", id);

        jdbcTemplate.update(sql, params);
    }

    public void deleteById(Long id) {
        final String sql = "UPDATE milestone SET is_deleted = :deleted_flag WHERE milestone_id = :id";

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("deleted_flag", DELETED_FLAG)
                .addValue("id", id);

        jdbcTemplate.update(sql, params);
    }
}
