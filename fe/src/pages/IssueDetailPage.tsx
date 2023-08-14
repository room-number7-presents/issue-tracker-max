import { useState, useEffect } from 'react';
import { Body } from '@components/issueDetailPage/Body';
import { PostInformation } from '@components/issueDetailPage/PostInformation';
import {
  editIssueAssignees,
  editIssueLabel,
  editIssueMilestone,
  getIssueDetail,
} from 'apis/api';
import { useParams } from 'react-router-dom';

type Props = {};

export const IssueDetailPage: React.FC = ({}) => {
  const { id } = useParams<{ id: string }>();

  const [issueDetailPageData, setIssueDetailPageData] =
    useState<IssueDetailPageData>(initialPageData);

  const [selectionsIds, setSelectionsIds] = useState<
    SelectionState['newIssuePage']
  >({
    assignees: [],
    labels: [],
    milestones: null,
  });

  const [selectionsOptions, setSelectionsOptions] = useState<
    SelectionState['detailPage']
  >({
    assignees: [],
    labels: [],
    milestones: null,
  });

  useEffect(() => {
    fetchIssueDetailPageData();
  }, []);

  const fetchIssueDetailPageData = async () => {
    if (id) {
      const pageData: IssueDetailPageData = await getIssueDetail(id);

      setIssueDetailPageData(pageData);

      const initialAssignees = pageData.assignees.map(
        (assignee) => assignee.userId,
      );
      const initialLabels = pageData.labels.map((label) => label.id);
      const initialMilestone = pageData.milestone
        ? pageData.milestone.id
        : null;

      setSelectionsOptions({
        assignees: pageData.assignees,
        labels: pageData.labels,
        milestones: pageData.milestone,
      });

      setSelectionsIds({
        assignees: initialAssignees,
        labels: initialLabels,
        milestones: initialMilestone,
      });
    }
  };

  const onChangeSelect = async (key: string) => {
    if (!id) {
      return;
    }
    try {
      switch (key) {
        case 'assignees':
          await editIssueAssignees(id, selectionsIds.assignees);
          break;
        case 'labels':
          await editIssueLabel(id, selectionsIds.labels);
          break;
        case 'milestones':
          await editIssueMilestone(id, selectionsIds.milestones);
          break;
        default:
          break;
      }

      // await fetchIssueDetailPageData();
    } catch (err) {
      console.error('에러인뎁쇼', err);
    }
  };

  const onMultipleSelectedAssignee = (id: number) => {
    setSelectionsIds((prev) => ({
      ...prev,
      assignees: prev.assignees.includes(id)
        ? prev.assignees.filter((itemId) => itemId !== id)
        : [...prev.assignees, id],
    }));
  };

  const onMultipleSelectedLabel = (id: number) => {
    setSelectionsIds((prev) => ({
      ...prev,
      labels: prev.labels.includes(id)
        ? prev.labels.filter((itemId) => itemId !== id)
        : [...prev.labels, id],
    }));
  };

  const onSingleSelectedMilestone = (id: number) => {
    setSelectionsIds((prev) => ({
      ...prev,
      milestones: prev.milestones === id ? null : id,
    }));
  };

  const onAddComment = (comment: any) => {
    setIssueDetailPageData({
      ...issueDetailPageData,
      comments: [...issueDetailPageData.comments, comment],
    });
  };

  return (
    <div
      css={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      <PostInformation issueDetailPageData={issueDetailPageData} />
      <Body
        issueDetailPageData={issueDetailPageData}
        onAddComment={onAddComment}
        //
        selectionsOptions={selectionsOptions}
        selections={selectionsIds}
        onChangeSelect={onChangeSelect}
        onSingleSelectedMilestone={onSingleSelectedMilestone}
        onMultipleSelectedAssignee={onMultipleSelectedAssignee}
        onMultipleSelectedLabel={onMultipleSelectedLabel}
      />
    </div>
  );
};

const initialPageData: IssueDetailPageData = {
  id: 0,
  title: '',
  contents: '',
  status: 'open',
  createdAt: '',
  author: {
    userId: 0,
    loginId: '',
    image: '',
  },
  assignees: [],
  labels: [],
  milestone: {
    id: 0,
    name: '',
    progress: 0,
  },
  comments: [],
};
