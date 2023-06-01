import { useRouter } from 'next/router'
import React, { useState, useEffect } from 'react'
import { Grid, Message, Button, Header } from 'semantic-ui-react'
import { ErrorMessage, LoadingMessage } from '@/components'
import api, { APIError } from '@/lib/api'
import type { GroupDTO } from '@/lib/dto/GroupDTO'
import { useIsMobile } from '@/utils/use-is-mobile'
import { AddGroupDialog } from './components/add-group-dialog'
import { EditGroupDialog } from './components/edit-group-dialog'
import { GroupsList } from './components/groups-list'

const Screen: React.FC = () => {
  const router = useRouter()
  const isMobile = useIsMobile()

  const [newGroupDialogOpen, setNewGroupDialogOpen] = useState<boolean>(false)
  const [editGroupDialogOpen, setEditGroupDialogOpen] = useState<boolean>(false)
  const [groupToEdit, setGroupToEdit] = useState<GroupDTO | null>(null)

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [data, setData] = useState<GroupDTO[]>([])
  const [error, setError] = useState<string>('')

  const onGroupCreated = (groupId: string) => {
    router.push(`/groups/${groupId}`)
  }

  const onGroupUpdated = () => {
    router.reload()
  }

  const onEditClicked = (group: GroupDTO) => {
    setGroupToEdit(group)
    setEditGroupDialogOpen(true)
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)

      try {
        const groups = await api.getGroups()

        setData(groups.data as GroupDTO[])
      } catch (e) {
        if (e instanceof APIError) {
          setError(e.message)
        } else {
          setError(`${e}`)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <>
      <Grid container={!isMobile} columns={1}>
        {isLoading && (
          <Grid.Column>
            <LoadingMessage content="Loading groups" />
          </Grid.Column>
        )}

        {error && (
          <Grid.Column>
            <ErrorMessage header="Unable to load groups" content={error} />
          </Grid.Column>
        )}

        <Grid.Row columns={2}>
          <Grid.Column width={isMobile ? 8 : 12}>
            <Header as="h1" content="Groups" />
          </Grid.Column>

          <Grid.Column width={isMobile ? 8 : 4} textAlign="right">
            <Button
              size={isMobile ? 'medium' : 'large'}
              icon="plus"
              content="Add Group"
              primary
              onClick={() => setNewGroupDialogOpen(true)}
            />
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column>
            {data.length > 0 ? (
              <GroupsList
                groups={data}
                onEditClicked={(group: GroupDTO) => onEditClicked(group)}
              />
            ) : (
              <Message warning>
                <p>No groups present yet.</p>
              </Message>
            )}
          </Grid.Column>
        </Grid.Row>
      </Grid>

      <AddGroupDialog
        open={newGroupDialogOpen}
        setOpen={setNewGroupDialogOpen}
        onGroupCreated={onGroupCreated}
      />

      {groupToEdit && (
        <EditGroupDialog
          open={editGroupDialogOpen}
          setOpen={setEditGroupDialogOpen}
          group={groupToEdit}
          onGroupUpdated={onGroupUpdated}
        />
      )}
    </>
  )
}

export default Screen
