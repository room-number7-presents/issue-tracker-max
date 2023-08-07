package org.presents.issuetracker.issue.repository;

import java.util.List;
import java.util.Map;
import java.util.Objects;

import javax.sql.DataSource;

import org.presents.issuetracker.issue.entity.Assignee;
import org.presents.issuetracker.issue.entity.Issue;
import org.presents.issuetracker.issue.entity.IssueLabel;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.jdbc.core.namedparam.SqlParameterSourceUtils;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

@Repository
public class IssueRepository {
	private final NamedParameterJdbcTemplate jdbcTemplate;

	public IssueRepository(DataSource dataSource) {
		this.jdbcTemplate = new NamedParameterJdbcTemplate(dataSource);
	}

	public Long save(Issue issue) {
		final String sql = "INSERT INTO issue(author_id, title, contents) VALUES (:authorId, :title, :contents)";

		SqlParameterSource params = new MapSqlParameterSource().addValue("authorId", issue.getAuthorId())
			.addValue("title", issue.getTitle())
			.addValue("contents", issue.getContents());

		KeyHolder keyHolder = new GeneratedKeyHolder();
		jdbcTemplate.update(sql, params, keyHolder);

		return Objects.requireNonNull(keyHolder.getKey()).longValue();
	}

	public void addAssignee(List<Assignee> assignees) {
		final String sql = "INSERT INTO assignee(issue_id, user_id) VALUES (:issueId, :userId)";

		jdbcTemplate.batchUpdate(sql, SqlParameterSourceUtils.createBatch(assignees));
	}

	public void deleteAllAssignee(Long issueId) {
		final String sql = "DELETE FROM assignee WHERE issue_id = :issueId";

		jdbcTemplate.update(sql, Map.of("issueId", issueId));
	}

	public void addLabel(List<IssueLabel> issueLabels) {
		final String sql = "INSERT INTO issue_label(issue_id, label_id) VALUES (:issueId, :labelId)";

		jdbcTemplate.batchUpdate(sql, SqlParameterSourceUtils.createBatch(issueLabels));
	}

	public void deleteAllLabel(Long issueId) {
		final String sql = "DELETE FROM issue_label WHERE issue_id = :issueId";

		jdbcTemplate.update(sql, Map.of("issueId", issueId));
	}

	public void setMilestone(Long issueId, Long milestoneId) {
		final String sql = "UPDATE issue SET milestone_id = :milestoneId WHERE issue_id = :issueId";

		SqlParameterSource params = new MapSqlParameterSource().addValue("milestoneId", milestoneId)
			.addValue("issueId", issueId);

		jdbcTemplate.update(sql, params);
	}

	public void deleteMilestone(Long issueId) {
		final String sql = "UPDATE issue SET milestone_id = NULL WHERE issue_id = :issueId";

		jdbcTemplate.update(sql, Map.of("issueId", issueId));
	}

	public List<Issue> findById(Long issueId) {
		final String sql = "SELECT issue_id, author_id, milestone_id, title, contents, created_at, status "
			+ "FROM issue WHERE issue_id = :issueId";

		SqlParameterSource params = new MapSqlParameterSource().addValue("issueId", issueId);

		return jdbcTemplate.query(sql, params, (rs, rowNum) -> Issue.builder()
			.id(rs.getLong("issue_id"))
			.authorId(rs.getLong("author_id"))
			.milestoneId(rs.getLong("milestone_id"))
			.title(rs.getString("title"))
			.contents(rs.getString("contents"))
			.createdAt(rs.getTimestamp("created_at").toLocalDateTime())
			.status(rs.getString("status"))
			.build());
	}

}
