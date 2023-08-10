import { ReactComponent as CheckBoxInitial } from '@assets/icons/checkBoxInitial.svg';
import { ReactComponent as AlertCircle } from '@assets/icons/alertCircle.svg';
import { ReactComponent as Archive } from '@assets/icons/archive.svg';
import { Button } from '@components/common/Button';
import { useTheme } from '@emotion/react';
import { DropDownPanel } from '@components/common/dropDown/DropDownPanel';
import { useState } from 'react';
import { DropDownContainer } from '@components/common/dropDown/DropDownContainer';
import { getLabels, getMilestones, getUsers } from '@utils/api';
import { DropDownList } from '@components/common/dropDown/DropDownList';

type Props = {
  openIssueCount: number;
  closedIssueCount: number;
  goToFilteredPage: (filterValue: string) => void;
};

type PanelOpenStatus = {
  assignees: boolean;
  label: boolean;
  milestone: boolean;
  author: boolean;
};

type PanelList = {
  users: {
    userId: number;
    loginId: string;
    image: string;
  }[];

  labels: {
    id: number;
    name: string;
    textColor: string;
    backgroundColor: string;
  }[];

  milestones: {
    id: number;
    name: string;
    progress: number;
  }[];
};

export const TableHeader: React.FC<Props> = ({
  openIssueCount = 0,
  closedIssueCount = 0,
  goToFilteredPage,
}) => {
  const theme = useTheme() as any;
  const [panelOpenStatus, setPanelOpenStatus] = useState<PanelOpenStatus>({
    assignees: false,
    label: false,
    milestone: false,
    author: false,
  });
  const [panelList, setPanelList] = useState<PanelList>({
    users: [],
    labels: [],
    milestones: [],
  });

  const onPanelOpen = (panel: keyof PanelOpenStatus) => {
    setPanelOpenStatus({
      assignees: false,
      label: false,
      milestone: false,
      author: false,
      [panel]: true,
    });
  };

  return (
    <div
      css={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}
    >
      <div css={{ display: 'flex', alignItems: 'center' }}>
        <CheckBoxInitial
          width={16}
          height={16}
          stroke={theme.neutral.border.default}
          css={{
            padding: '0px 32px',
            cursor: 'pointer',

            '&: hover': {
              opacity: theme.opacity.hover,
            },
          }}
        />

        <div css={{ display: 'flex', gap: '24px', textWrap: 'nowrap' }}>
          <Button
            typeVariant="ghost"
            onClick={() => {
              goToFilteredPage(location.search + ' status:open');
            }}
            css={
              location.search === '' || location.search.includes('status:open')
                ? {
                    font: theme.fonts.selectedBold16,
                    color: theme.neutral.text.strong,
                    stroke: theme.neutral.text.strong,
                  }
                : {
                    font: theme.fonts.availableMedium16,
                    color: theme.neutral.text.default,
                    stroke: theme.neutral.text.strong,
                  }
            }
          >
            <AlertCircle />
            <span>{`열린 이슈 (${openIssueCount})`}</span>
          </Button>

          <Button
            typeVariant="ghost"
            onClick={() => {
              goToFilteredPage(location.search + ' status:closed');
            }}
            css={
              location.search.includes('status:closed')
                ? {
                    font: theme.fonts.selectedBold16,
                    color: theme.neutral.text.strong,
                    stroke: theme.neutral.text.strong,
                  }
                : {
                    font: theme.fonts.availableMedium16,
                    color: theme.neutral.text.default,
                    stroke: theme.neutral.text.strong,
                  }
            }
          >
            <Archive />
            <span>{`닫힌 이슈 (${closedIssueCount})`}</span>
          </Button>
        </div>
      </div>

      <div
        css={{
          display: 'flex',
          gap: '32px',
          marginRight: '32px',
        }}
      >
        <DropDownContainer
          size="M"
          indicator="담당자"
          isPanelOpen={panelOpenStatus.assignees}
          onClick={() => {
            onPanelOpen('assignees');

            if (panelList.users.length !== 0) {
              return;
            }

            (async () => {
              const users = await getUsers();

              setPanelList((prev) => {
                return {
                  ...prev,
                  users,
                };
              });
            })();
          }}
        >
          <DropDownPanel
            position="right"
            panelHeader="담당자 필터"
            onOutsideClick={() =>
              setPanelOpenStatus((prev) => ({ ...prev, assignees: false }))
            }
          >
            {panelList.users.length > 0 &&
              panelList.users.map(({ userId: id, loginId: name }) => (
                <DropDownList
                  key={id}
                  {...{
                    item: { id, name },
                    isSelected: location.search.includes(`assignee:${name}`),
                    onClick: () => {
                      goToFilteredPage(`${location.search} assignee:${name}`);
                    },
                  }}
                />
              ))}
          </DropDownPanel>
        </DropDownContainer>
        <DropDownContainer
          size="M"
          indicator="레이블"
          isPanelOpen={panelOpenStatus.label}
          onClick={() => {
            onPanelOpen('label');

            if (panelList.labels.length === 0) {
              return;
            }

            (async () => {
              const labels = await getLabels();

              setPanelList((prev) => {
                return {
                  ...prev,
                  labels,
                };
              });
            })();
          }}
        >
          <DropDownPanel
            position="right"
            panelHeader="레이블 필터"
            onOutsideClick={() =>
              setPanelOpenStatus((prev) => ({ ...prev, label: false }))
            }
          >
            {panelList.labels.length > 0 &&
              panelList.labels.map(({ id, name, backgroundColor }) => (
                <DropDownList
                  key={id}
                  {...{
                    item: { id, name, backgroundColor },
                    isSelected: location.search.includes(`label:${name}`),
                    onClick: () => {
                      goToFilteredPage(`${location.search} label:${name}`);
                    },
                  }}
                />
              ))}
          </DropDownPanel>
        </DropDownContainer>
        <DropDownContainer
          size="M"
          indicator="마일스톤"
          isPanelOpen={panelOpenStatus.milestone}
          onClick={() => {
            onPanelOpen('milestone');

            if (panelList.milestones.length === 0) {
              return;
            }

            (async () => {
              const milestones = await getMilestones();

              setPanelList((prev) => {
                return {
                  ...prev,
                  milestones,
                };
              });
            })();
          }}
        >
          <DropDownPanel
            position="right"
            panelHeader="마일스톤 필터"
            onOutsideClick={() =>
              setPanelOpenStatus((prev) => ({ ...prev, milestone: false }))
            }
          >
            {panelList.milestones.length > 0 &&
              panelList.milestones.map(({ id, name }) => (
                <DropDownList
                  key={id}
                  {...{
                    item: { id, name },
                    isSelected: location.search.includes(`milestone:${name}`),
                    onClick: () => {
                      goToFilteredPage(`${location.search} milestone:${name}`);
                    },
                  }}
                />
              ))}
          </DropDownPanel>
        </DropDownContainer>
        <DropDownContainer
          size="M"
          indicator="작성자"
          isPanelOpen={panelOpenStatus.author}
          onClick={() => {
            onPanelOpen('author');

            if (panelList.users.length === 0) {
              return;
            }

            (async () => {
              const users = await getUsers();

              setPanelList((prev) => {
                return {
                  ...prev,
                  users,
                };
              });
            })();
          }}
        >
          <DropDownPanel
            position="right"
            panelHeader="작성자 필터"
            onOutsideClick={() =>
              setPanelOpenStatus((prev) => ({ ...prev, author: false }))
            }
          >
            {panelList.users.length > 0 &&
              panelList.users.map(({ userId: id, loginId: name }) => (
                <DropDownList
                  key={id}
                  {...{
                    item: { id, name },
                    isSelected: location.search.includes(`assignee:${name}`),
                    onClick: () => {
                      goToFilteredPage(`${location.search} assignee:${name}`);
                    },
                  }}
                />
              ))}
          </DropDownPanel>
        </DropDownContainer>
      </div>
    </div>
  );
};
